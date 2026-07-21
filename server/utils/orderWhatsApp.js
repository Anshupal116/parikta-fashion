const {
  sendWhatsAppTemplate,
} = require("./sendWhatsApp");

const sendOrderPlacedWhatsApp = async (order) => {
  const customerName =
    order?.customer?.name ||
    order?.customerName ||
    "Customer";

  const customerPhone =
    order?.customer?.phone ||
    order?.phone ||
    order?.mobile;

  if (!customerPhone) {
    console.log(
      `WhatsApp skipped: phone missing for ${order?.orderId}`
    );
    return;
  }

  return sendWhatsAppTemplate({
    to: customerPhone,

    // Meta dashboard ka exact approved template name
    templateName: "jaspers_market_order_confirmation_v1",

    languageCode: "en_US",

    // Parameters template ke exact order me hone chahiye
    bodyParameters: [
      customerName,
      order.orderId || "N/A",
      `₹${Number(order.amount || 0).toLocaleString("en-IN")}`,
    ],
  });
};

module.exports = {
  sendOrderPlacedWhatsApp,
};