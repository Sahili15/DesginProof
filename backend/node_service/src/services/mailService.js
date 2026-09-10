import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter using Ethereal (Mock) or configure your own SMTP
const createTransporter = async () => {
    // Determine if using Ethereal or Gmail from Env
    const smtpHost = process.env.SMTP_HOST || 'smtp.ethereal.email';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.EMAIL_USER;
    const smtpPass = process.env.EMAIL_PASS;

    let transporter;

    if (smtpUser && smtpPass) {
        // Use configured credentials
        transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });
    } else {
        // Fallback to ethereal if no credentials are provided
        console.warn('⚠️ No SMTP credentials found. Creating an ethereal test account.');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    return transporter;
};

export const sendLegalNoticeEmail = async ({ to, subject, brandName, websiteUrl, originalImageUrl, copiedImageUrl, customMessage }) => {
    try {
        const transporter = await createTransporter();

        const mailOptions = {
            from: `"Legal Team" <${transporter.options.auth.user}>`,
            to: to,
            subject: subject || `URGENT: Unauthorized Use of Copyrighted Image - ${brandName}`,
            text: customMessage || `Hello,\n\nIt has come to our attention that an image belonging to ${brandName} is being used without authorization on your website.\n\nWebsite containing the image: ${websiteUrl}\nOriginal Image URL: ${originalImageUrl}\nCopied Image URL: ${copiedImageUrl || 'N/A'}\n\nWe kindly request you to remove this image from your website within 2-3 business days. Failure to comply may result in further legal action to protect the intellectual property of ${brandName}.\n\nRegards,\nLegal Team on behalf of ${brandName}`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [Node.js] EMAIL SENT SUCCESSFULLY!`);
        console.log(`  | To: ${to}`);
        console.log(`  | Brand: ${brandName}`);

        // Show ethereal URL if it's an ethereal account
        if (info.messageId && transporter.options.host.includes('ethereal')) {
            console.log(`  | View Mock Email Inbox at: ${nodemailer.getTestMessageUrl(info)}`);
        }

        return { success: true, info };
    } catch (error) {
        console.error('❌ [Node.js] Failed to send email:', error);
        return { success: false, error: error.message };
    }
};
