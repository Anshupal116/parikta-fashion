import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (order) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.setTextColor(154, 63, 77);
  doc.text("PARIKTA", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text("Fashion Invoice", 14, 27);

  doc.setFontSize(12);
  doc.setTextColor(0);

  doc.text(`Invoice : INV-${order.orderId}`, 14, 40);
  doc.text(`Order ID : ${order.orderId}`, 14, 47);

  doc.text(
    `Date : ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
    14,
    54
  );

  // Customer
  doc.setFontSize(14);
  doc.text("Customer Details", 14, 68);

  doc.setFontSize(11);

  doc.text(`Name : ${order.customer?.name || ""}`, 14, 76);

  doc.text(`Phone : ${order.customer?.phone || ""}`, 14, 83);

  doc.text(`Email : ${order.customer?.email || ""}`, 14, 90);

  doc.text(
    `Address : ${[
      order.address?.house,
      order.address?.city,
      order.address?.state,
      order.address?.pincode,
    ]
      .filter(Boolean)
      .join(", ")}`,
    14,
    97
  );

  // Items
  autoTable(doc, {
    startY: 110,

    head: [
      [
        "Product",
        "Size",
        "Qty",
        "Price",
        "Total",
      ],
    ],

    body: order.items.map((item) => [
      item.name,
      item.selectedSize || "Free Size",
      item.qty,
      `₹${item.price}`,
      `₹${item.qty * item.price}`,
    ]),
  });

  const y = doc.lastAutoTable.finalY + 12;

  doc.setFontSize(12);

  doc.text(
    `Subtotal : ₹${order.subtotal || order.amount}`,
    140,
    y
  );

  doc.text(
    `Discount : ₹${order.discountAmount || 0}`,
    140,
    y + 8
  );

  doc.text(
    `Grand Total : ₹${order.amount}`,
    140,
    y + 16
  );

  if (order.couponCode) {
    doc.text(
      `Coupon : ${order.couponCode}`,
      14,
      y + 16
    );
  }

  doc.setFontSize(10);

  doc.text(
    "Thank you for shopping with Parikta ❤️",
    14,
    285
  );

  doc.save(`Invoice-${order.orderId}.pdf`);
};