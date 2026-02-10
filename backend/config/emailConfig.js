const nodemailer = require('nodemailer')

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use 'gmail', 'outlook', 'yahoo', etc.
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email app password (not regular password)
    }
})

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.log('Email service error:', error.message)
    } else {
        console.log('Email service is ready to send messages')
    }
})

// Send OTP via Email
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: {
            name: 'Farmer Market Intelligence',
            address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Your OTP for Account Verification - Farmer Market Intelligence',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #22c55e, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; border: 2px dashed #22c55e; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #22c55e; letter-spacing: 8px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌾 Farmer Market Intelligence</h1>
                        <p>Account Verification</p>
                    </div>
                    <div class="content">
                        <h2>Hello!</h2>
                        <p>You have requested to verify your account. Please use the following OTP (One-Time Password) to complete your registration:</p>
                        
                        <div class="otp-box">
                            <p style="margin: 0; color: #666;">Your OTP Code</p>
                            <p class="otp-code">${otp}</p>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Important:</strong>
                            <ul style="margin: 5px 0;">
                                <li>This OTP is valid for <strong>5 minutes</strong> only.</li>
                                <li>Do not share this code with anyone.</li>
                                <li>If you didn't request this, please ignore this email.</li>
                            </ul>
                        </div>
                        
                        <p>Thank you for joining our farming community!</p>
                        <p>Best regards,<br><strong>Farmer Market Intelligence Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>&copy; ${new Date().getFullYear()} Farmer Market Intelligence. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log('Email sent successfully:', info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error('Error sending email:', error)
        return { success: false, error: error.message }
    }
}

module.exports = { sendOTPEmail, transporter }
