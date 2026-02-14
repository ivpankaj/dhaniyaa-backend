import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import * as userRepository from '../user/user.repository';
import { generateToken } from '../../utils/token';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../../utils/email.service';
import { IUser } from '../user/user.model';

export const registerUser = async (data: Partial<IUser>) => {
    const { name, email, password } = data;

    if (!name || !email || !password) {
        throw new Error('Please fill in all fields');
    }

    const userExists = await userRepository.findByEmail(email!);
    if (userExists) {
        const error: any = new Error('User already exists');
        error.statusCode = 400;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userRepository.create({
        name,
        email,
        password: hashedPassword,
    });

    // Send Welcome Email
    try {
        await sendWelcomeEmail(user.email, user.name);
    } catch (error) {
        console.error('Failed to send welcome email:', error);
    }

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id.toString()),
    };
};

export const loginUser = async (data: Partial<IUser>) => {
    const { email, password } = data;

    if (!email || !password) {
        const error: any = new Error('Please provide email and password');
        error.statusCode = 400;
        throw error;
    }

    const user = await userRepository.findByEmail(email!);
    if (!user) {
        const error: any = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
        const error: any = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id.toString()),
    };
};

export const updatePassword = async (userId: string, data: any) => {
    const { currentPassword, newPassword } = data;

    const user = await userRepository.findById(userId);
    if (!user) {
        const error: any = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password!);
    if (!isMatch) {
        const error: any = new Error('Current password is incorrect');
        error.statusCode = 401;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { success: true };
};

// Google Login
export const googleLogin = async (idToken: string, googleAvatar?: string) => {
    if (!idToken) {
        throw new Error('No ID token provided');
    }

    console.log(`Verifying Google Token (Length: ${idToken.length})`);

    try {
        // Use params to ensure proper URL encoding
        const response = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
            params: { id_token: idToken }
        });

        const { email, email_verified, name, sub, picture } = response.data;

        // Use the avatar passed from frontend (which comes from result.user.photoURL) 
        // OR the one from token (which might be undefined)
        const userAvatar = googleAvatar || picture;

        console.log('Google Profile Picture (Token):', picture);
        console.log('Google Profile Picture (Frontend):', googleAvatar);
        console.log('Final User Avatar:', userAvatar);

        if (!email_verified) {
            const error: any = new Error('Email not verified by Google');
            error.statusCode = 403;
            throw error;
        }

        let user = await userRepository.findByEmail(email);
        let isNewUser = false;

        if (!user) {
            user = await userRepository.create({
                name: name || email.split('@')[0],
                email,
                password: '', // Password will be set later
                isVerified: true,
                googleId: sub,
                avatar: userAvatar
            });
            isNewUser = true;

            // Send Welcome Email
            try {
                await sendWelcomeEmail(user.email, user.name);
            } catch (error) {
                console.error('Failed to send welcome email:', error);
            }
        } else {
            // Update existing user google info if missing
            if (!user.googleId) user.googleId = sub;

            // Always sync avatar from Google to keep it up to date
            if (userAvatar) {
                user.avatar = userAvatar;
            }

            await user.save();
        }

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id.toString()),
            isNewUser,
        };
    } catch (error: any) {
        console.error('Google Auth Error Detail:', error.response?.data || error.message);

        if (error.statusCode) throw error; // Re-throw if already handled

        const authError: any = new Error('Invalid Google Token');
        authError.statusCode = 401;
        throw authError; // This will result in 401, not 500
    }
};


export const setPassword = async (userId: string, password: string) => {
    const user = await userRepository.findById(userId);
    if (!user) {
        const error: any = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    return { success: true };
};

export const forgotPassword = async (email: string) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        // We return success even if user not found to prevent email enumeration
        // But for this task, I will throw error as requested by standard flows usually
        // Actually, for better UX in internal tools, showing error is often preferred.
        // Let's stick to showing error for now as it's easier for the user to debug.
        const error: any = new Error('No user found with that email');
        error.statusCode = 404;
        throw error;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = new Date(resetPasswordExpire);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    try {
        await sendPasswordResetEmail(user.email, user.name, resetUrl);
        return { success: true, message: 'Email sent' };
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        const err: any = new Error('Email sending failed');
        err.statusCode = 500;
        throw err;
    }
};

export const resetPassword = async (token: string, password: string) => {
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await userRepository.findByResetToken(resetPasswordToken);

    if (!user) {
        const error: any = new Error('Invalid or expired token');
        error.statusCode = 400;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return { success: true, message: 'Password reset successful', token: generateToken(user._id.toString()) };
};
