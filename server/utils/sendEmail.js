const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  if (!to) {
    throw new Error("Receiver email is required");
  }

  const { data, error } = await resend.emails.send({
    from:
      process.env.EMAIL_FROM ||
      "Parikta Fashion <onboarding@resend.dev>",

    to: [to],

    subject,

    html,
  });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
};

module.exports = sendEmail;