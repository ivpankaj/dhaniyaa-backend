export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export const paginate = async <T>(
    model: any,
    query: any = {},
    options: PaginationOptions = {},
    populate: any[] = []
): Promise<PaginatedResult<T>> => {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20)); // Limit max to 100 for safety
    const skip = (page - 1) * limit;

    const countPromise = model.countDocuments(query);
    const dataPromise = model.find(query)
        .sort({ [options.sortBy || 'createdAt']: options.sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit);

    // Apply population
    populate.forEach(p => {
        dataPromise.populate(p);
    });

    const [total, data] = await Promise.all([countPromise, dataPromise]);
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};
