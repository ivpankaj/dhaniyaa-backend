import bcrypt from 'bcryptjs';
import axios from 'axios';
import * as userRepository from '../user/user.repository';
import { generateToken } from '../../utils/token';
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
