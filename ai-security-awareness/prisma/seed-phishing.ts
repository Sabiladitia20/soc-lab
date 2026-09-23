import { PrismaClient } from '@prisma/client';
import { phishingScenarios } from '../lib/mock-data';

const prisma = new PrismaClient();

const landingPages = [
  {
    name: 'Microsoft 365 Login',
    category: 'Credential Harvesting',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <title>Sign in to your account</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f2f1; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .login-box { background: white; padding: 44px; width: 380px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
    .logo { width: 108px; margin-bottom: 24px; }
    h1 { font-size: 24px; font-weight: 600; margin-bottom: 16px; color: #1b1b1b; }
    input { width: 100%; padding: 10px; margin-bottom: 16px; border: 1px solid #605e5c; border-bottom: 1px solid #000; box-sizing: border-box; }
    button { background-color: #0067b8; color: white; border: none; padding: 10px 20px; font-size: 15px; cursor: pointer; width: 100px; float: right; }
    .footer { margin-top: 32px; font-size: 13px; color: #0067b8; }
  </style>
</head>
<body>
  <div class="login-box">
    <img src="https://logincdn.msauth.net/shared/1.0/content/images/microsoft_logo_ee5c8d9fb6248c938fd0dc19370e90bd.svg" alt="Microsoft" class="logo">
    <h1>Sign in</h1>
    <input type="email" placeholder="Email, phone, or Skype">
    <div style="font-size: 13px; margin-bottom: 16px;">No account? <a href="#" style="color: #0067b8; text-decoration: none;">Create one!</a></div>
    <div style="font-size: 13px; margin-bottom: 32px;"><a href="#" style="color: #0067b8; text-decoration: none;">Can't access your account?</a></div>
    <div style="overflow: auto;"><button>Next</button></div>
  </div>
</body>
</html>`
  },
  {
    name: 'Google Login',
    category: 'Credential Harvesting',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <title>Sign in - Google Accounts</title>
  <style>
    body { font-family: 'Roboto', arial, sans-serif; display: flex; justify-content: center; padding-top: 80px; margin: 0; background: #fff; }
    .container { width: 448px; border: 1px solid #dadce0; border-radius: 8px; padding: 48px 40px 36px; box-sizing: border-box; text-align: center; }
    h1 { font-size: 24px; font-weight: 400; margin: 16px 0 8px; }
    p { font-size: 16px; margin-bottom: 32px; color: #202124; }
    input { width: 100%; padding: 13px 15px; margin-bottom: 32px; border: 1px solid #dadce0; border-radius: 4px; box-sizing: border-box; font-size: 16px; }
    .actions { display: flex; justify-content: space-between; align-items: center; }
    a { color: #1a73e8; text-decoration: none; font-weight: 500; }
    button { background: #1a73e8; color: white; border: none; padding: 10px 24px; border-radius: 4px; font-weight: 500; font-size: 14px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <div style="color: #ea4335; font-size: 24px; font-weight: bold; margin-bottom: 10px;">Google</div>
    <h1>Sign in</h1>
    <p>Use your Google Account</p>
    <input type="email" placeholder="Email or phone">
    <div style="text-align: left; margin-bottom: 40px;">
      <a href="#">Forgot email?</a>
    </div>
    <div class="actions">
      <a href="#">Create account</a>
      <button>Next</button>
    </div>
  </div>
</body>
</html>`
  },
  {
    name: 'LinkedIn Login',
    category: 'Credential Harvesting',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <title>LinkedIn Login</title>
  <style>
    body { font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Fira Sans", Ubuntu, Oxygen, "Oxygen Sans", Cantarell, sans-serif; background: #f3f2ef; display: flex; flex-direction: column; align-items: center; margin: 0; padding-top: 50px; }
    .header { width: 100%; max-width: 350px; margin-bottom: 24px; }
    .card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); width: 100%; max-width: 350px; box-sizing: border-box; }
    h1 { font-size: 32px; margin: 0 0 4px; font-weight: 600; }
    p { margin: 0 0 20px; font-size: 14px; color: #666; }
    input { width: 100%; padding: 12px; margin-bottom: 16px; border: 1px solid #000; border-radius: 4px; box-sizing: border-box; font-size: 16px; }
    button { width: 100%; background: #0a66c2; color: white; border: none; padding: 14px; border-radius: 28px; font-size: 16px; font-weight: 600; cursor: pointer; margin-bottom: 16px; }
    .links { text-align: center; }
    .links a { color: #0a66c2; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="color: #0a66c2; margin:0;">Linked<span style="background:#0a66c2; color:white; padding: 0 2px; border-radius: 2px;">in</span></h2>
  </div>
  <div class="card">
    <h1>Sign in</h1>
    <p>Stay updated on your professional world</p>
    <input type="text" placeholder="Email or Phone">
    <input type="password" placeholder="Password">
    <div class="links" style="text-align: left; margin-bottom: 16px;"><a href="#">Forgot password?</a></div>
    <button>Sign in</button>
    <div style="text-align: center; margin-top: 16px;">
      New to LinkedIn? <a href="#" style="color: #0a66c2; text-decoration: none; font-weight: 600;">Join now</a>
    </div>
  </div>
</body>
</html>`
  },
  {
    name: 'Generic IT Update',
    category: 'Software Update',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <title>IT System Update</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 50px; text-align: center; }
    .container { background: white; padding: 40px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-top: 5px solid #d32f2f; }
    h1 { color: #333; }
    p { color: #666; line-height: 1.6; font-size: 16px; }
    .btn { display: inline-block; padding: 15px 30px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Critical System Update Required</h1>
    <p>Your workstation is currently missing critical security patches. Failure to update within 24 hours will result in network disconnection.</p>
    <p>Please download and install the update tool to ensure continuous compliance.</p>
    <a href="#" class="btn">Download Update.exe</a>
  </div>
</body>
</html>`
  },
  {
    name: 'Netflix Payment Failed',
    category: 'Billing Scam',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <title>Netflix - Update Payment</title>
  <style>
    body { background-color: #000; color: #fff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: flex; justify-content: center; padding-top: 40px; margin: 0; }
    .container { background: #000; width: 450px; padding: 60px 68px; box-sizing: border-box; text-align: left; }
    .header { margin-bottom: 28px; }
    .header h1 { color: #e50914; margin: 0; font-size: 32px; }
    .main { background: rgba(0,0,0,0.75); }
    h2 { font-size: 32px; margin-bottom: 28px; font-weight: 500; }
    p { font-size: 16px; color: #737373; line-height: 1.5; margin-bottom: 24px; }
    input { width: 100%; background: #333; border: none; border-radius: 4px; padding: 16px 20px; box-sizing: border-box; color: #fff; margin-bottom: 16px; font-size: 16px; }
    button { width: 100%; background: #e50914; color: #fff; border: none; border-radius: 4px; padding: 16px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>NETFLIX</h1></div>
    <h2>Update your credit or debit card.</h2>
    <p>Your current membership is on hold. We couldn't process your last payment. Please update your payment information to continue watching.</p>
    <input type="text" placeholder="Card number">
    <input type="text" placeholder="Expiration date (MM/YY)">
    <input type="text" placeholder="Security code (CVV)">
    <button>Save Payment Info</button>
  </div>
</body>
</html>`
  },
  {
    name: 'Package Delivery Failed',
    category: 'Notification Scam',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <title>Track Your Package</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 0; margin: 0; }
    .header { background: #ffcc00; padding: 20px; text-align: center; font-weight: bold; font-size: 24px; }
    .content { padding: 40px; max-width: 500px; margin: auto; background: white; margin-top: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
    h2 { color: #333; margin-top: 0; }
    p { color: #555; line-height: 1.5; }
    .tracking-box { background: #f5f5f5; padding: 15px; border: 1px dashed #ccc; text-align: center; font-size: 18px; margin: 20px 0; font-family: monospace; }
    .btn { display: block; width: 100%; padding: 15px; background: #e31837; color: white; text-align: center; text-decoration: none; border-radius: 4px; font-weight: bold; box-sizing: border-box; }
  </style>
</head>
<body>
  <div class="header">EXPRESS DELIVERY</div>
  <div class="content">
    <h2>Delivery Attempt Failed</h2>
    <p>Dear Customer,</p>
    <p>We attempted to deliver your package today but no one was available to sign for it. A rescheduling fee of Rp 10.000 is required.</p>
    <div class="tracking-box">Tracking ID: <strong>992838481231</strong></div>
    <p>Please pay the fee and reschedule your delivery within 48 hours to avoid returning to sender.</p>
    <a href="#" class="btn">Pay Fee & Reschedule</a>
  </div>
</body>
</html>`
  }
];

async function main() {
  console.log('Seeding data...');

  await prisma.campaign.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.landingPageTemplate.deleteMany();

  for (const lp of landingPages) {
    await prisma.landingPageTemplate.create({
      data: lp
    });
  }
  console.log('Landing pages seeded');

  // Only get the 8 we want or so
  const templatesToSeed = phishingScenarios.slice(0, 8);
  for (const scenario of templatesToSeed) {
    
    // determine difficulty based on red flags
    let difficulty = 'Medium';
    if (scenario.redFlags.length <= 1) difficulty = 'Hard';
    else if (scenario.redFlags.length >= 3) difficulty = 'Easy';

    // Try to guess a category
    let category = 'Phishing';
    if (scenario.subject.toLowerCase().includes('password') || scenario.subject.toLowerCase().includes('login')) category = 'Credential Harvesting';
    else if (scenario.subject.toLowerCase().includes('invoice') || scenario.subject.toLowerCase().includes('payment')) category = 'Billing Scam';
    else if (scenario.subject.toLowerCase().includes('delivery') || scenario.subject.toLowerCase().includes('paket')) category = 'Notification Scam';

    let bodyHtml = scenario.body;
    
    // Append links with the TRACKING_LINK placeholder
    if (scenario.links && scenario.links.length > 0) {
      bodyHtml += '<div style="margin-top: 24px; text-align: left;">';
      for (const link of scenario.links) {
        bodyHtml += `<a href="{{TRACKING_LINK}}" style="display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-bottom: 10px;">${link.text}</a><br/>`;
      }
      bodyHtml += '</div>';
    }

    await prisma.emailTemplate.create({
      data: {
        name: `${scenario.senderName} - ${scenario.subject}`,
        category,
        difficulty,
        sender: `${scenario.senderName} <${scenario.senderEmail}>`,
        subject: scenario.subject,
        bodyHtml
      }
    });
  }
  console.log('Email templates seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
