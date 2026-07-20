const orderConfirmationTemplate = (order) => {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">
            ${item.name}
            <br>
            <small>Size: ${item.selectedSize || "Free Size"}</small>
          </td>

          <td style="padding:10px;border-bottom:1px solid #eee;">
            ${item.qty}
          </td>

          <td style="padding:10px;border-bottom:1px solid #eee;">
            ₹${Number(item.price || 0).toLocaleString("en-IN")}
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;background:#f7f3f1;padding:30px;">
      <div style="max-width:650px;margin:auto;background:#fff;padding:30px;border-radius:12px;">
        <h1 style="color:#9A3F4D;margin-top:0;">
          Parikta Fashion
        </h1>

        <h2>Order Confirmed</h2>

        <p>
          Hi <b>${order.customer?.name || "Customer"}</b>,
        </p>

        <p>
          Your order has been placed successfully.
        </p>

        <p>
          <b>Order ID:</b> ${order.orderId}
        </p>

        <p>
          <b>Payment Method:</b> ${order.paymentMethod}
        </p>

        <p>
          <b>Payment Status:</b> ${order.paymentStatus}
        </p>

        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:10px;background:#f5eeee;">Product</th>
              <th style="text-align:left;padding:10px;background:#f5eeee;">Qty</th>
              <th style="text-align:left;padding:10px;background:#f5eeee;">Price</th>
            </tr>
          </thead>

          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <p style="font-size:18px;margin-top:20px;">
          <b>Total: ₹${Number(order.amount || 0).toLocaleString("en-IN")}</b>
        </p>

        <a
          href="${process.env.FRONTEND_URL}/track-order/${order.orderId}"
          style="
            display:inline-block;
            margin-top:15px;
            padding:12px 24px;
            background:#9A3F4D;
            color:#fff;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Track Order
        </a>

        <p style="margin-top:25px;">
          Thank you for shopping with Parikta Fashion ❤️
        </p>
      </div>
    </div>
  `;
};

module.exports = orderConfirmationTemplate;