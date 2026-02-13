"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPassword = exports.googleLogin = exports.updatePassword = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const axios_1 = __importDefault(require("axios"));
const userRepository = __importStar(require("../user/user.repository"));
const token_1 = require("../../utils/token");
const registerUser = async (data) => {
    const { name, email, password } = data;
    if (!name || !email || !password) {
        throw new Error('Please fill in all fields');
    }
    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
        const error = new Error('User already exists');
        error.statusCode = 400;
        throw error;
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(password, salt);
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
        token: (0, token_1.generateToken)(user._id.toString()),
    };
};
exports.registerUser = registerUser;
const loginUser = async (data) => {
    const { email, password } = data;
    if (!email || !password) {
        const error = new Error('Please provide email and password');
        error.statusCode = 400;
        throw error;
    }
    const user = await userRepository.findByEmail(email);
    if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: (0, token_1.generateToken)(user._id.toString()),
    };
};
exports.loginUser = loginUser;
const updatePassword = async (userId, data) => {
    const { currentPassword, newPassword } = data;
    const user = await userRepository.findById(userId);
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isMatch) {
        const error = new Error('Current password is incorrect');
        error.statusCode = 401;
        throw error;
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    user.password = await bcryptjs_1.default.hash(newPassword, salt);
    await user.save();
    return { success: true };
};
exports.updatePassword = updatePassword;
// Google Login
const googleLogin = async (idToken, googleAvatar) => {
    if (!idToken) {
        throw new Error('No ID token provided');
    }
    console.log(`Verifying Google Token (Length: ${idToken.length})`);
    try {
        // Use params to ensure proper URL encoding
        const response = await axios_1.default.get('https://oauth2.googleapis.com/tokeninfo', {
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
            const error = new Error('Email not verified by Google');
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
        }
        else {
            // Update existing user google info if missing
            if (!user.googleId)
                user.googleId = sub;
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
            token: (0, token_1.generateToken)(user._id.toString()),
            isNewUser,
        };
    }
    catch (error) {
        console.error('Google Auth Error Detail:', error.response?.data || error.message);
        if (error.statusCode)
            throw error; // Re-throw if already handled
        const authError = new Error('Invalid Google Token');
        authError.statusCode = 401;
        throw authError; // This will result in 401, not 500
    }
};
exports.googleLogin = googleLogin;
const setPassword = async (userId, password) => {
    const user = await userRepository.findById(userId);
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    user.password = await bcryptjs_1.default.hash(password, salt);
    await user.save();
    return { success: true };
};
exports.setPassword = setPassword;
