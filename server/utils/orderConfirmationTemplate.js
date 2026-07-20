const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

const getStatusStyle = (status = "") => {
  const styles = {
    Pending: {
      background: "#FFF7E6",
      color: "#B76E00",
    },
    Confirmed: {
      background: "#EAF7EE",
      color: "#217A3C",
    },
    Shipped: {
      background: "#EAF2FF",
      color: "#2457A6",
    },
    Delivered: {
      background: "#E8F7EE",
      color: "#157347",
    },
    Cancelled: {
      background: "#FDECEC",
      color: "#B42318",
    },
  };

  return (
    styles[status] || {
      background: "#F3F4F6",
      color: "#374151",
    }
  );
};

const orderConfirmationTemplate = (order) => {
  const frontendUrl =
    process.env.FRONTEND_URL || "https://parikta.com";

  // Email images ke liye absolute public URL hona chahiye.
  const logoUrl =
    process.env.EMAIL_LOGO_URL ||
    "https://parikta.com/logo.png";

  const customerName =
    escapeHtml(order?.customer?.name || "Customer");

  const orderId = escapeHtml(order?.orderId || "");

  const paymentMethod = escapeHtml(
    order?.paymentMethod || "COD"
  );

  const paymentStatus = escapeHtml(
    order?.paymentStatus || "Pending"
  );

  const orderStatus = escapeHtml(
    order?.status || "Pending"
  );

  const statusStyle = getStatusStyle(order?.status);

  const trackOrderUrl =
    `${frontendUrl}/orders/${encodeURIComponent(
      order?.orderId || ""
    )}`;

  const itemsHtml = (order?.items || [])
    .map((item) => {
      const itemName = escapeHtml(
        item?.name || "Product"
      );

      const itemImage = escapeHtml(
        item?.image ||
          "https://placehold.co/120x150?text=Product"
      );

      const itemSize = escapeHtml(
        item?.selectedSize || "Free Size"
      );

      const quantity = Number(item?.qty) || 1;
      const price = Number(item?.price) || 0;
      const itemTotal = price * quantity;

      return `
        <tr>
          <td
            style="
              padding: 18px 0;
              border-bottom: 1px solid #eee7e3;
            "
          >
            <table
              role="presentation"
              width="100%"
              cellspacing="0"
              cellpadding="0"
              border="0"
            >
              <tr>
                <td
                  width="86"
                  valign="top"
                  style="padding-right: 16px;"
                >
                  <img
                    src="${itemImage}"
                    alt="${itemName}"
                    width="78"
                    height="98"
                    style="
                      display: block;
                      width: 78px;
                      height: 98px;
                      object-fit: cover;
                      border-radius: 10px;
                      border: 1px solid #eee7e3;
                      background: #f8f5f3;
                    "
                  />
                </td>

                <td valign="top">
                  <div
                    style="
                      font-family: Arial, Helvetica, sans-serif;
                      font-size: 15px;
                      line-height: 22px;
                      font-weight: 700;
                      color: #2d211d;
                      margin-bottom: 6px;
                    "
                  >
                    ${itemName}
                  </div>

                  <div
                    style="
                      font-family: Arial, Helvetica, sans-serif;
                      font-size: 13px;
                      line-height: 20px;
                      color: #75625a;
                    "
                  >
                    Size: ${itemSize}
                  </div>

                  <div
                    style="
                      font-family: Arial, Helvetica, sans-serif;
                      font-size: 13px;
                      line-height: 20px;
                      color: #75625a;
                    "
                  >
                    Quantity: ${quantity}
                  </div>
                </td>

                <td
                  valign="top"
                  align="right"
                  style="
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 15px;
                    line-height: 22px;
                    font-weight: 700;
                    color: #2d211d;
                    white-space: nowrap;
                  "
                >
                  ${formatCurrency(itemTotal)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join("");

  const couponRow =
    Number(order?.discountAmount || 0) > 0
      ? `
        <tr>
          <td
            style="
              padding: 5px 0;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 14px;
              color: #75625a;
            "
          >
            Coupon Discount
            ${
              order?.couponCode
                ? `<span style="font-size:12px;">(${escapeHtml(
                    order.couponCode
                  )})</span>`
                : ""
            }
          </td>

          <td
            align="right"
            style="
              padding: 5px 0;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 14px;
              color: #17803d;
              font-weight: 700;
            "
          >
            -${formatCurrency(order.discountAmount)}
          </td>
        </tr>
      `
      : "";

  const address = [
    order?.address?.house,
    order?.address?.city,
    order?.address?.state,
    order?.address?.pincode,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join(", ");

  const message =
    order?.paymentStatus === "Paid"
      ? "Your payment was successful and your order has been confirmed."
      : "We have received your order and will notify you when it is confirmed.";

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <meta
      name="color-scheme"
      content="light"
    />

    <meta
      name="supported-color-schemes"
      content="light"
    />

    <title>Order Confirmation</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f5f1ef;
      font-family: Arial, Helvetica, sans-serif;
    "
  >
    <div
      style="
        display: none;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        color: transparent;
      "
    >
      Your Parikta Fashion order ${orderId} has been placed successfully.
    </div>

    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="background-color: #f5f1ef;"
    >
      <tr>
        <td
          align="center"
          style="padding: 28px 12px;"
        >
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              width: 100%;
              max-width: 640px;
              background: #ffffff;
              border-radius: 18px;
              overflow: hidden;
              box-shadow: 0 8px 30px rgba(45, 33, 29, 0.08);
            "
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                style="
                  padding: 28px 24px 22px;
                  background: #2d211d;
                "
              >
                <a
                  href="${frontendUrl}"
                  style="text-decoration: none;"
                >
                  <img
                    src="${logoUrl}"
                    alt="Parikta Fashion"
                    width="150"
                    style="
                      display: block;
                      width: 150px;
                      max-width: 100%;
                      height: auto;
                      border: 0;
                    "
                  />
                </a>
              </td>
            </tr>

            <!-- Hero -->
            <tr>
              <td
                align="center"
                style="
                  padding: 38px 30px 28px;
                  background: #fffaf7;
                "
              >
                <div
                  style="
                    width: 58px;
                    height: 58px;
                    line-height: 58px;
                    margin: 0 auto 18px;
                    border-radius: 50%;
                    background: #eaf7ee;
                    color: #217a3c;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 28px;
                    font-weight: 700;
                    text-align: center;
                  "
                >
                  ✓
                </div>

                <h1
                  style="
                    margin: 0 0 10px;
                    font-family: Georgia, 'Times New Roman', serif;
                    font-size: 30px;
                    line-height: 38px;
                    color: #2d211d;
                    font-weight: 700;
                  "
                >
                  Thank you for your order!
                </h1>

                <p
                  style="
                    margin: 0;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 15px;
                    line-height: 24px;
                    color: #75625a;
                  "
                >
                  Hi ${customerName}, ${message}
                </p>
              </td>
            </tr>

            <!-- Order Info -->
            <tr>
              <td style="padding: 28px 30px 10px;">
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    background: #faf7f5;
                    border: 1px solid #eee7e3;
                    border-radius: 14px;
                  "
                >
                  <tr>
                    <td style="padding: 18px;">
                      <table
                        role="presentation"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                      >
                        <tr>
                          <td valign="top">
                            <div
                              style="
                                font-family: Arial, Helvetica, sans-serif;
                                font-size: 11px;
                                line-height: 18px;
                                color: #9a8880;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                                margin-bottom: 3px;
                              "
                            >
                              Order ID
                            </div>

                            <div
                              style="
                                font-family: Arial, Helvetica, sans-serif;
                                font-size: 15px;
                                line-height: 22px;
                                color: #2d211d;
                                font-weight: 700;
                              "
                            >
                              ${orderId}
                            </div>
                          </td>

                          <td
                            align="right"
                            valign="top"
                          >
                            <span
                              style="
                                display: inline-block;
                                padding: 7px 12px;
                                border-radius: 999px;
                                background: ${statusStyle.background};
                                color: ${statusStyle.color};
                                font-family: Arial, Helvetica, sans-serif;
                                font-size: 12px;
                                font-weight: 700;
                              "
                            >
                              ${orderStatus}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Product Section -->
            <tr>
              <td style="padding: 22px 30px 0;">
                <h2
                  style="
                    margin: 0;
                    font-family: Georgia, 'Times New Roman', serif;
                    font-size: 21px;
                    line-height: 28px;
                    color: #2d211d;
                  "
                >
                  Order Summary
                </h2>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  ${itemsHtml}
                </table>
              </td>
            </tr>

            <!-- Price Summary -->
            <tr>
              <td style="padding: 22px 30px;">
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    background: #faf7f5;
                    border-radius: 14px;
                  "
                >
                  <tr>
                    <td style="padding: 18px;">
                      <table
                        role="presentation"
                        width="100%"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                      >
                        <tr>
                          <td
                            style="
                              padding: 5px 0;
                              font-family: Arial, Helvetica, sans-serif;
                              font-size: 14px;
                              color: #75625a;
                            "
                          >
                            Subtotal
                          </td>

                          <td
                            align="right"
                            style="
                              padding: 5px 0;
                              font-family: Arial, Helvetica, sans-serif;
                              font-size: 14px;
                              color: #2d211d;
                            "
                          >
                            ${formatCurrency(order?.subtotal)}
                          </td>
                        </tr>

                        ${couponRow}

                        <tr>
                          <td
                            colspan="2"
                            style="
                              padding-top: 10px;
                              border-top: 1px solid #e7ddd8;
                            "
                          ></td>
                        </tr>

                        <tr>
                          <td
                            style="
                              padding: 4px 0;
                              font-family: Arial, Helvetica, sans-serif;
                              font-size: 17px;
                              color: #2d211d;
                              font-weight: 700;
                            "
                          >
                            Total
                          </td>

                          <td
                            align="right"
                            style="
                              padding: 4px 0;
                              font-family: Arial, Helvetica, sans-serif;
                              font-size: 19px;
                              color: #8c3f31;
                              font-weight: 700;
                            "
                          >
                            ${formatCurrency(order?.amount)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Payment & Delivery -->
            <tr>
              <td style="padding: 0 30px 24px;">
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tr>
                    <td
                      valign="top"
                      width="48%"
                      style="
                        padding: 18px;
                        background: #faf7f5;
                        border-radius: 14px;
                      "
                    >
                      <div
                        style="
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 11px;
                          color: #9a8880;
                          text-transform: uppercase;
                          letter-spacing: 1px;
                          margin-bottom: 8px;
                        "
                      >
                        Payment
                      </div>

                      <div
                        style="
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 14px;
                          line-height: 22px;
                          color: #2d211d;
                          font-weight: 700;
                        "
                      >
                        ${paymentMethod}
                      </div>

                      <div
                        style="
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 13px;
                          line-height: 20px;
                          color: #75625a;
                        "
                      >
                        Status: ${paymentStatus}
                      </div>
                    </td>

                    <td width="4%"></td>

                    <td
                      valign="top"
                      width="48%"
                      style="
                        padding: 18px;
                        background: #faf7f5;
                        border-radius: 14px;
                      "
                    >
                      <div
                        style="
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 11px;
                          color: #9a8880;
                          text-transform: uppercase;
                          letter-spacing: 1px;
                          margin-bottom: 8px;
                        "
                      >
                        Delivery Address
                      </div>

                      <div
                        style="
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 13px;
                          line-height: 21px;
                          color: #2d211d;
                        "
                      >
                        ${address || "Address not available"}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Buttons -->
            <tr>
              <td
                align="center"
                style="padding: 4px 30px 36px;"
              >
                <a
                  href="${trackOrderUrl}"
                  style="
                    display: inline-block;
                    padding: 14px 26px;
                    margin: 0 5px 10px;
                    border-radius: 8px;
                    background: #8c3f31;
                    color: #ffffff;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 14px;
                    font-weight: 700;
                    text-decoration: none;
                  "
                >
                  View Order
                </a>

                <a
                  href="${frontendUrl}"
                  style="
                    display: inline-block;
                    padding: 13px 25px;
                    margin: 0 5px 10px;
                    border-radius: 8px;
                    border: 1px solid #8c3f31;
                    color: #8c3f31;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 14px;
                    font-weight: 700;
                    text-decoration: none;
                  "
                >
                  Continue Shopping
                </a>
              </td>
            </tr>

            <!-- Help -->
            <tr>
              <td
                align="center"
                style="
                  padding: 22px 30px;
                  background: #f8f3f0;
                  border-top: 1px solid #eee7e3;
                "
              >
                <p
                  style="
                    margin: 0 0 5px;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 13px;
                    line-height: 21px;
                    color: #75625a;
                  "
                >
                  Need help with your order?
                </p>

                <a
                  href="mailto:support@parikta.com"
                  style="
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 13px;
                    line-height: 21px;
                    color: #8c3f31;
                    font-weight: 700;
                    text-decoration: none;
                  "
                >
                  support@parikta.com
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="
                  padding: 24px 30px;
                  background: #2d211d;
                "
              >
                <p
                  style="
                    margin: 0 0 8px;
                    font-family: Georgia, 'Times New Roman', serif;
                    font-size: 17px;
                    color: #ffffff;
                    font-weight: 700;
                  "
                >
                  Parikta Fashion
                </p>

                <p
                  style="
                    margin: 0;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 11px;
                    line-height: 18px;
                    color: #cbbdb7;
                  "
                >
                  Elegant fashion, thoughtfully delivered.
                  <br />
                  © ${new Date().getFullYear()} Parikta Fashion.
                  All rights reserved.
                </p>
              </td>
            </tr>
          </table>

          <p
            style="
              margin: 16px 0 0;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 11px;
              line-height: 18px;
              color: #9a8880;
            "
          >
            This is an automated email regarding your order.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
};

module.exports = orderConfirmationTemplate;