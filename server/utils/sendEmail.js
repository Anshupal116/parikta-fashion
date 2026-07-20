const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  family: 4,

  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
});

const sendEmail = async ({ to, subject, html }) => {
  if (!to) {
    throw new Error("Receiver email is required");
  }

  return transporter.sendMail({
    from: `"Parikta Fashion" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;