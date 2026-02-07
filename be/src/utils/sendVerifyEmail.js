const nodemailer = require("nodemailer");

module.exports = async function sendVerifyEmail(to, url) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"TaskHero" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Verify your email",
    html: `
      <h3>Email verification</h3>
      <p>Click the link below to verify your account:</p>
      <a href="${url}">${url}</a>
    `,
  });
};
