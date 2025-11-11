// Test email sending with Resend API
// Run with: node test-email.js

const RESEND_API_KEY = process.env.RESEND_API_KEY || 'your-key-here';

async function testEmail() {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>This is a test email</p>',
      }),
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('ERROR: Email send failed');
      if (response.status === 401) {
        console.error('  → Invalid API key or not authorized');
      } else if (response.status === 429) {
        console.error('  → Rate limit exceeded');
      } else if (response.status === 422) {
        console.error('  → Validation error - check from/to addresses');
      }
    } else {
      console.log('✓ Email sent successfully!');
    }
  } catch (error) {
    console.error('Exception:', error.message);
  }
}

testEmail();
