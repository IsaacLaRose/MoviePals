require('dotenv').config();

async function sendEmail(to, subject, html) {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.EMAIL_FROM || 'MoviePals onboarding <onboarding@resend.dev>';

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from,
                to,
                subject,
                html
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Resend error:", data);
            throw new Error(data.message || 'Email failed to send');
        }

        console.log("Email sent to", to, "- ID:", data.id);
        return data;
    } catch (e) {
        console.error("Resend error:", e);
        throw e; // Re-throw so the calling code knows it failed
    }
}

module.exports = sendEmail;