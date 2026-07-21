const formatPhoneNumber = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.startsWith("0") && digits.length === 11) {
    return `91${digits.slice(1)}`;
  }

  return digits;
};

const sendWhatsAppTemplate = async ({
  to,
  templateName,
  languageCode = "en_US",
  bodyParameters = [],
}) => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion =
    process.env.WHATSAPP_API_VERSION || "v25.0";

  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp environment variables missing");
  }

  const formattedPhone = formatPhoneNumber(to);

  if (!formattedPhone) {
    throw new Error("Customer phone number missing");
  }

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: [
            {
              type: "body",
              parameters: bodyParameters.map((value) => ({
                type: "text",
                text: String(value ?? ""),
              })),
            },
          ],
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "WhatsApp API error:",
      JSON.stringify(data, null, 2)
    );

    throw new Error(
      data?.error?.message || "WhatsApp message failed"
    );
  }

  return data;
};

module.exports = {
  sendWhatsAppTemplate,
};