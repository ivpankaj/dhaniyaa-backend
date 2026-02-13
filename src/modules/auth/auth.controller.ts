import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';

export const register = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = await authService.loginUser(req.body);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const updatePassword = async (req: any, res: Response, next: NextFunction) => {
    try {
        const result = await authService.updatePassword(req.user!._id.toString(), req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};


export const googleLogin = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { token, avatar } = req.body;
        const result = await authService.googleLogin(token, avatar);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const setPassword = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { password } = req.body;
        const result = await authService.setPassword(req.user!._id.toString(), password);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};
