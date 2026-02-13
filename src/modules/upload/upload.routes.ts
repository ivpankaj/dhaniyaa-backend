import express from 'express';
import { protect } from '../../middleware/auth.middleware';
import { generateSignature } from '../../utils/cloudinary';

const router = express.Router();

router.get('/signature', protect, (req, res) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'dhaniyaa';

    const paramsToSign = {
        timestamp,
        folder
    };

    const signature = generateSignature(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

    res.json({
        success: true,
        data: {
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder
        }
    });
});

export default router;
