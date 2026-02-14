import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import organizationRoutes from './modules/organization/organization.routes';
import projectRoutes from './modules/project/project.routes';
import ticketRoutes from './modules/ticket/ticket.routes';
import commentRoutes from './modules/comment/comment.routes';
import notificationRoutes from './modules/notification/notification.routes';
import sprintRoutes from './modules/sprint/sprint.routes';
import aiRoutes from './modules/ai/ai.routes';
import activityRoutes from './modules/activity/activity.routes';
import invitationRoutes from './modules/invitation/invitation.routes';
import uploadRoutes from './modules/upload/upload.routes';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling
app.use(errorHandler);

export default app;
