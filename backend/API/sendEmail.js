const nodemailer = require('nodemailer');

async function sendEmail(to, subject, html) {
    const transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transport.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
    });
}

module.exports = sendEmail;
