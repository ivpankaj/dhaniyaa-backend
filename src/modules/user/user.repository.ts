import { User, IUser } from './user.model';

export const findByEmail = async (email: string) => {
    return await User.findOne({ email });
};

export const create = async (data: Partial<IUser>) => {
    return await User.create(data);
};

export const findById = async (id: string) => {
    return await User.findById(id);
};
