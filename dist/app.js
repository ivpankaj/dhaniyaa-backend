"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const error_middleware_1 = require("./middleware/error.middleware");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const organization_routes_1 = __importDefault(require("./modules/organization/organization.routes"));
const project_routes_1 = __importDefault(require("./modules/project/project.routes"));
const ticket_routes_1 = __importDefault(require("./modules/ticket/ticket.routes"));
const comment_routes_1 = __importDefault(require("./modules/comment/comment.routes"));
const notification_routes_1 = __importDefault(require("./modules/notification/notification.routes"));
const sprint_routes_1 = __importDefault(require("./modules/sprint/sprint.routes"));
const ai_routes_1 = __importDefault(require("./modules/ai/ai.routes"));
const activity_routes_1 = __importDefault(require("./modules/activity/activity.routes"));
const invitation_routes_1 = __importDefault(require("./modules/invitation/invitation.routes"));
const upload_routes_1 = __importDefault(require("./modules/upload/upload.routes"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use((0, compression_1.default)());
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/organizations', organization_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/tickets', ticket_routes_1.default);
app.use('/api/comments', comment_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/sprints', sprint_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/activities', activity_routes_1.default);
app.use('/api/invitations', invitation_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
// Error Handling
app.use(error_middleware_1.errorHandler);
exports.default = app;
