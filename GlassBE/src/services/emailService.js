import nodemailer from "nodemailer";

// Configure Gmail SMTP transporter
// Try app password without spaces first (Gmail app passwords are typically 16 chars without spaces)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  requireTLS: true,
  auth: {
    user: "duongndanh43@gmail.com",
    pass: "zchbvmyzrrwhkbxh", // App password without spaces
  },
  // Add connection timeout
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  // Fix SSL certificate validation issue
  tls: {
    rejectUnauthorized: false, // Accept self-signed certificates
  },
});

/**
 * Send password reset code email
 * @param {string} email - Recipient email address
 * @param {string} resetCode - 6-digit reset code
 * @returns {Promise} Promise that resolves when email is sent
 */
const sendResetCodeEmail = (email, resetCode) => {
  return new Promise(async (resolve, reject) => {
    try {
      const mailOptions = {
        from: "duongndanh43@gmail.com",
        to: email,
        subject: "Password Reset Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You have requested to reset your password. Please use the following code to verify your identity:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${resetCode}</h1>
            </div>
            <p>This code will expire in 30 minutes.</p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      resolve(info);
    } catch (error) {
      console.error("Email service error details:", {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        message: error.message,
        stack: error.stack,
      });
      reject(error);
    }
  });
};

export default {
  sendResetCodeEmail,
};

