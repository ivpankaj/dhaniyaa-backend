"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // Customize for production
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        },
    });
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        socket.on('join_project', (projectId) => {
            socket.join(projectId);
            console.log(`Socket ${socket.id} joined project: ${projectId}`);
        });
        socket.on('join_user', (userId) => {
            socket.join(userId);
            console.log(`Socket ${socket.id} joined user: ${userId}`);
        });
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getIO = getIO;
