"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInvitationEmail = exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.sendSprintNotificationEmail = exports.sendTicketDeletionEmail = exports.sendTicketStatusEmail = exports.sendTicketCreationEmail = exports.sendTicketAssignmentEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const getHtmlTemplate = (title, bodyContent, actionUrl, actionText) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
            overflow: hidden;
            border: 1px solid #f1f5f9;
        }
        .header {
            padding: 32px 40px;
            border-bottom: 1px solid #f1f5f9;
            text-align: center;
        }
        .logo {
            font-size: 24px;
            font-weight: 800;
            color: #8b5cf6; /* Violet-500 equivalent */
            text-decoration: none;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 40px;
        }
        h1 {
            font-size: 20px;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 24px;
            color: #111827;
            text-align: center;
        }
        p {
            margin-bottom: 16px;
            color: #4b5563;
        }
        .highlight-box {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
            border: 1px solid #e5e7eb;
        }
        .highlight-item {
            margin-bottom: 8px;
            font-size: 14px;
        }
        .highlight-item:last-child {
            margin-bottom: 0;
        }
        .label {
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
        }
        .value {
            color: #111827;
            font-weight: 500;
        }
        .btn-container {
            text-align: center;
            margin-top: 32px;
            margin-bottom: 16px;
        }
        .btn {
            display: inline-block;
            background-color: #8b5cf6;
            color: #ffffff;
            font-weight: 600;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            transition: background-color 0.2s;
            font-size: 14px;
        }
        .footer {
            background-color: #f9fafb;
            padding: 24px 40px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #f1f5f9;
        }
        .footer a {
            color: #6b7280;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="logo">Dhaniyaa</span>
        </div>
        <div class="content">
            <h1>${title}</h1>
            ${bodyContent}
            
            ${actionUrl && actionText ? `
            <div class="btn-container">
                <a href="${actionUrl}" class="btn">${actionText}</a>
            </div>
            ` : ''}
            
            <p style="margin-top: 32px; font-size: 13px; color: #9ca3af; text-align: center;">
                If you have any questions, feel free to reply to this email.
            </p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Dhaniyaa. All rights reserved.<br>
            Designed for modern teams.
        </div>
    </div>
</body>
</html>
    `;
};
const sendEmail = async (to, subject, htmlContent) => {
    // If SMTP credentials are provided, use real email sending
    const smtpEmail = process.env.SMTP_EMAIL?.trim();
    const smtpPass = process.env.SMTP_PASSWORD?.trim();
    if (smtpEmail && smtpPass) {
        try {
            const transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: smtpEmail,
                    pass: smtpPass,
                },
            });
            const info = await transporter.sendMail({
                from: `"Dhaniyaa" <${smtpEmail}>`,
                to,
                subject,
                text: 'Please view this email in an HTML compatible client.', // Fallback text
                html: htmlContent
            });
            console.log('Message sent: %s', info.messageId);
            return true;
        }
        catch (error) {
            console.error('Error sending email:', error);
            console.log('--- Failed to send real email, falling back to log ---');
        }
    }
    // Fallback or dev mode logging
    console.log('================================================');
    console.log(`📧 EMAIL SENT TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY (HTML Content available in code)`);
    console.log('================================================');
    return Promise.resolve(true);
};
exports.sendEmail = sendEmail;
const sendTicketAssignmentEmail = async (to, userName, ticketTitle, ticketType, priority) => {
    const title = `New Assignment`;
    const subject = `New Task Assigned: ${ticketTitle}`;
    const bodyContent = `
        <p>Hi ${userName},</p>
        <p>You have been assigned a new task in Dhaniyaa. Here are the details:</p>
        
        <div class="highlight-box">
            <div class="highlight-item">
                <span class="label">Task</span><br>
                <span class="value">${ticketTitle}</span>
            </div>
            <div class="highlight-item" style="margin-top: 12px;">
                <span class="label">Type</span><br>
                <span class="value">${ticketType}</span>
            </div>
            <div class="highlight-item" style="margin-top: 12px;">
                <span class="label">Priority</span><br>
                <span class="value" style="color: ${priority === 'High' || priority === 'Critical' ? '#ef4444' : 'inherit'}">${priority}</span>
            </div>
        </div>
    `;
    const html = getHtmlTemplate(title, bodyContent, process.env.FRONTEND_URL || 'https://dhaniyaa.cookmytech.site', 'View Task');
    return (0, exports.sendEmail)(to, subject, html);
};
exports.sendTicketAssignmentEmail = sendTicketAssignmentEmail;
const sendTicketCreationEmail = async (to, userName, ticketTitle, ticketType, priority) => {
    const title = `Ticket Created`;
    const subject = `Confirmation: Ticket Created - ${ticketTitle}`;
    const bodyContent = `
        <p>Hi ${userName},</p>
        <p>Your ticket has been successfully created in Dhaniyaa. Our team (or yourself) will get to it soon!</p>
        
        <div class="highlight-box">
            <div class="highlight-item">
                <span class="label">Ticket</span><br>
                <span class="value">${ticketTitle}</span>
            </div>
            <div class="highlight-item" style="margin-top: 12px;">
                <span class="label">Type</span><br>
                <span class="value">${ticketType}</span>
            </div>
            <div class="highlight-item" style="margin-top: 12px;">
                <span class="label">Priority</span><br>
                <span class="value" style="color: ${priority === 'High' || priority === 'Critical' ? '#ef4444' : 'inherit'}">${priority}</span>
            </div>
        </div>
    `;
    const html = getHtmlTemplate(title, bodyContent, process.env.FRONTEND_URL || 'https://dhaniyaa.cookmytech.site', 'View Ticket');
    return (0, exports.sendEmail)(to, subject, html);
};
exports.sendTicketCreationEmail = sendTicketCreationEmail;
const sendTicketStatusEmail = async (to, userName, ticketTitle, status, actionBy) => {
    const title = `Status Update`;
    const subject = `Ticket Updated: ${ticketTitle}`;
    const bodyContent = `
        <p>Hi ${userName},</p>
        <p>The status of a ticket you are following has changed.</p>
        
        <div class="highlight-box">
            <div class="highlight-item">
                <span class="label">Ticket</span><br>
                <span class="value">${ticketTitle}</span>
            </div>
            <div class="highlight-item" style="margin-top: 12px;">
                <span class="label">New Status</span><br>
                <span class="value" style="font-weight: 700;">${status}</span>
            </div>
            <div class="highlight-item" style="margin-top: 12px;">
                <span class="label">Updated By</span><br>
                <span class="value">${actionBy}</span>
            </div>
        </div>
    `;
    const html = getHtmlTemplate(title, bodyContent, process.env.FRONTEND_URL || 'https://dhaniyaa.cookmytech.site', 'View Ticket');
    return (0, exports.sendEmail)(to, subject, html);
};
exports.sendTicketStatusEmail = sendTicketStatusEmail;
const sendTicketDeletionEmail = async (to, userName, ticketTitle, actionBy) => {
    const title = `Ticket Deleted`;
    const subject = `Ticket Deleted: ${ticketTitle}`;
    const bodyContent = `
        <p>Hi ${userName},</p>
        <p>The following ticket has been deleted from the project board.</p>
        
        <div class="highlight-box" style="border-left: 4px solid #ef4444;">
            <div class="highlight-item">
                <span class="label">Ticket</span><br>
                <span class="value">${ticketTitle}</span>
            </div>
            <div class="highlight-item" style="margin-top: 12px;">
                <span class="label">Deleted By</span><br>
                <span class="value">${actionBy}</span>
            </div>
        </div>
    `;
    const html = getHtmlTemplate(title, bodyContent);
    return (0, exports.sendEmail)(to, subject, html);
};
exports.sendTicketDeletionEmail = sendTicketDeletionEmail;
const sendSprintNotificationEmail = async (to, userName, sprintName, action, actionBy) => {
    const title = `Sprint Update`;
    const subject = `Cycle Update: ${sprintName}`;
    const bodyContent = `
        <p>Hi ${userName},</p>
        <p>There has been an update to your sprint cycle.</p>
        
        <div class="highlight-box">
            <div class="highlight-item">
                <span class="label">Sprint</span><br>
                <span class="value">${sprintName}</span>
            </div>
            <div class="highlight-item" style="margin-top: 12px;">
                <span class="label">Action</span><br>
                <span class="value" style="text-transform: capitalize;">${action}</span>
            </div>
            <div class="highlight-item" style="margin-top: 12px;">
                <span class="label">Updated By</span><br>
                <span class="value">${actionBy}</span>
            </div>
        </div>
    `;
    const html = getHtmlTemplate(title, bodyContent, process.env.FRONTEND_URL || 'https://dhaniyaa.cookmytech.site', 'View Sprint Board');
    return (0, exports.sendEmail)(to, subject, html);
};
exports.sendSprintNotificationEmail = sendSprintNotificationEmail;
const sendWelcomeEmail = async (to, userName) => {
    const title = `Welcome to Dhaniyaa`;
    const subject = 'Welcome to Dhaniyaa!';
    const bodyContent = `
        <p>Hi ${userName},</p>
        <p>Welcome to <strong>Dhaniyaa</strong>! We are thrilled to have you join our community of builders and creators.</p>
        <p>Dhaniyaa is designed to help you organize your projects, collaborate with your team, and ship faster—all without the clutter.</p>
        <p>Ready to get started? Create your first organization and invite your team.</p>
    `;
    const html = getHtmlTemplate(title, bodyContent, process.env.FRONTEND_URL || 'https://dhaniyaa.cookmytech.site', 'Go to Dashboard');
    return (0, exports.sendEmail)(to, subject, html);
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetEmail = async (to, userName, resetUrl) => {
    const title = `Reset Password`;
    const subject = 'Reset Your Password';
    const bodyContent = `
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password for your Dhaniyaa account.</p>
        <p>Please click the button below to set a new password. This link will expire in 10 minutes.</p>
        <p style="font-size: 13px; color: #6b7280; margin-top: 20px;">If you did not request this change, you can safely ignore this email.</p>
    `;
    const html = getHtmlTemplate(title, bodyContent, resetUrl, 'Reset Password');
    return (0, exports.sendEmail)(to, subject, html);
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendInvitationEmail = async (to, inviterName, projectName, description, actionUrl) => {
    const title = `Project Invitation`;
    const subject = `Invitation to join ${projectName} on Dhaniyaa`;
    const bodyContent = `
        <p>Hi there,</p>
        <p><strong>${inviterName}</strong> has invited you to join the project <strong>"${projectName}"</strong> on Dhaniyaa.</p>
        
        <div class="highlight-box">
            <div class="highlight-item">
                <span class="label">Project</span><br>
                <span class="value">${projectName}</span>
            </div>
            ${description ? `
            <div class="highlight-item" style="margin-top: 12px;">
                <span class="label">Description</span><br>
                <span class="value">${description}</span>
            </div>
            ` : ''}
        </div>

        <p>Click the button below to accept the invitation and start collaborating.</p>
    `;
    const html = getHtmlTemplate(title, bodyContent, actionUrl, 'Accept Invitation');
    return (0, exports.sendEmail)(to, subject, html);
};
exports.sendInvitationEmail = sendInvitationEmail;
