require('dotenv').config();
const sendEmail = require('./sendEmail');

async function test() {
    try {
        await sendEmail(
            'is992883@ucf.edu', // replace with your email
            'Test Email from MoviePals',
            '<p>If you receive this, Resend is working!</p>'
        );
        console.log('Email sent successfully');
    } catch (e) {
        console.error('Error sending email:', e);
    }
}

test();
