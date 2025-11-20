require('dotenv').config();

async function testResend() {
  const apiKey = process.env.RESEND_API_KEY;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'MoviePals onboarding <onboarding@resend.dev>',
      to: 'swaggerhub094@gmail.com',
      subject: 'Test Email from MoviePals',
      html: '<p>If you receive this, Resend is working!</p>'
    })
  });

  const data = await response.json();
  console.log(data);
}

testResend().catch(console.error);
