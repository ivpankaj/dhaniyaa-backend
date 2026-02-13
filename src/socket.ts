import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

export const initSocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: '*', // Customize for production
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        },
    });

    io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join_project', (projectId: string) => {
            socket.join(projectId);
            console.log(`Socket ${socket.id} joined project: ${projectId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};
