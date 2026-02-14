import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, text: string) => {
    // If SMTP credentials are provided, use real email sending
    const smtpEmail = process.env.SMTP_EMAIL?.trim();
    const smtpPass = process.env.SMTP_PASSWORD?.trim();

    if (smtpEmail && smtpPass) {
        try {
            const transporter = nodemailer.createTransport({
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
                text,
                html: text.replace(/\n/g, '<br>') // Simple html conversion
            });

            console.log('Message sent: %s', info.messageId);
            return true;
        } catch (error) {
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

export const sendTicketAssignmentEmail = async (to: string, userName: string, ticketTitle: string, ticketType: string, priority: string) => {
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
    return sendEmail(to, subject, body.trim());
};

export const sendTicketStatusEmail = async (to: string, userName: string, ticketTitle: string, status: string, actionBy: string) => {
    const subject = `Ticket Status Updated: ${ticketTitle}`;
    const body = `
Hi ${userName},

The status of ticket "${ticketTitle}" has been updated to **${status}** by ${actionBy}.

You can view the details in Dhaniyaa.

Best regards,
Dhaniyaa Team
`;
    return sendEmail(to, subject, body.trim());
};

export const sendTicketDeletionEmail = async (to: string, userName: string, ticketTitle: string, actionBy: string) => {
    const subject = `Ticket Deleted: ${ticketTitle}`;
    const body = `
Hi ${userName},

The ticket "${ticketTitle}" has been deleted by ${actionBy}.

Best regards,
Dhaniyaa Team
`;
    return sendEmail(to, subject, body.trim());
};

export const sendSprintNotificationEmail = async (to: string, userName: string, sprintName: string, action: string, actionBy: string) => {
    const subject = `Cycle Update: ${sprintName}`;
    const body = `
Hi ${userName},

The cycle "${sprintName}" has been ${action} by ${actionBy}.

Best regards,
Dhaniyaa Team
`;
    return sendEmail(to, subject, body.trim());
};

export const sendWelcomeEmail = async (to: string, userName: string) => {
    const subject = 'Welcome to Dhaniyaa!';
    const body = `
Hi ${userName},

Welcome to Dhaniyaa! We are excited to have you on board.
Dhaniyaa is designed to help you streamline your workflow and collaborate seamlessly.

If you have any questions, feel free to reply to this email.

Best regards,
Dhaniyaa Team
`;
    return sendEmail(to, subject, body.trim());
};

export const sendPasswordResetEmail = async (to: string, userName: string, resetUrl: string) => {
    const subject = 'Password Reset Request';
    const body = `
Hi ${userName},

You requested a password reset. Please click the link below to reset your password:

${resetUrl}

If you did not request this, please ignore this email.

Best regards,
Dhaniyaa Team
`;
    return sendEmail(to, subject, body.trim());
};
