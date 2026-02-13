"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
dotenv_1.default.config();
const PORT = process.env.PORT || 8080;
(0, database_1.connectDatabase)();
const socket_1 = require("./socket");
const server = app_1.default.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const io = (0, socket_1.initSocket)(server);
app_1.default.set('io', io);
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
