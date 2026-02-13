import crypto from 'crypto';

export const generateSignature = (paramsToSign: any, apiSecret: string) => {
    const sortedParams = Object.keys(paramsToSign)
        .sort()
        .map(key => `${key}=${paramsToSign[key]}`)
        .join('&');

    const signature = crypto
        .createHash('sha1')
        .update(sortedParams + apiSecret)
        .digest('hex');

    return signature;
};
