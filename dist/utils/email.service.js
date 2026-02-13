"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTicketAssignmentEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (to, subject, text) => {
    // If SMTP credentials are provided, use real email sending
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
        try {
            const transporter = nodemailer_1.default.createTransport({
                service: 'gmail', // Default to gmail for simplicity, or use host/port if provided
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD,
                },
            });
            const info = await transporter.sendMail({
                from: `"Dhaniyaa" <${process.env.SMTP_EMAIL}>`,
                to,
                subject,
                text,
                html: text.replace(/\n/g, '<br>') // Simple html conversion
            });
            console.log('Message sent: %s', info.messageId);
            return true;
        }
        catch (error) {
            console.error('Error sending email:', error);
            // Fallback to logging
            console.log('--- Failed to send real email, falling back to log ---');
        }
    }
    // Fallback or dev mode logging
    console.log('================================================');
    console.log(`📧 EMAIL SENT TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY:`);
    console.log(text);
    console.log('================================================');
    return Promise.resolve(true);
};
exports.sendEmail = sendEmail;
const sendTicketAssignmentEmail = async (to, userName, ticketTitle, ticketType, priority) => {
    const subject = `New Task Assigned: ${ticketTitle}`;
    const body = `
Hi ${userName},

A new ${ticketType} has been assigned to you.

Title: ${ticketTitle}
Priority: ${priority}

You can view the details in dhaniyaa.

Best regards,
Dhaniyaa Team
`;
    return (0, exports.sendEmail)(to, subject, body.trim());
};
exports.sendTicketAssignmentEmail = sendTicketAssignmentEmail;
