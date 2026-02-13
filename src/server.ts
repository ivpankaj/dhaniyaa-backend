import dotenv from 'dotenv';
import app from './app';
import { connectDatabase } from './config/database';

dotenv.config();

const PORT = process.env.PORT || 8080;

connectDatabase();

import { initSocket } from './socket';

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const io = initSocket(server);
(app as any).set('io', io);

process.on('unhandledRejection', (err: any) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

console.log('Force restart: tsconfig update applied');
