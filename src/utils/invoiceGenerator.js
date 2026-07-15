import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

const BRAND = {
  primary: [154, 63, 77],
  dark: [91, 59, 50],
  soft: [253, 234, 230],
  border: [234, 219, 212],
  muted: [139, 116, 107],
  green: [22, 120, 70],
};

const formatMoney = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const safeText = (value, fallback = "-") => {
  const text = String(value || "").trim();
  return text || fallback;
};

const createTrackingQr = async (orderId) => {
  const trackingUrl = `https://parikta.com/track-order/${orderId}`;

  return QRCode.toDataURL(trackingUrl, {
    width: 300,
    margin: 1,
    errorCorrectionLevel: "H",
    color: {
      dark: "#5B3B32",
      light: "#FFFFFF",
    },
  });
};

const addPageFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);

    doc.setDrawColor(...BRAND.border);
    doc.line(
      14,
      pageHeight - 18,
      pageWidth - 14,
      pageHeight - 18
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.muted);

    doc.text(
      "Thank you for shopping with Parikta Fashion.",
      14,
      pageHeight - 11
    );

    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - 14,
      pageHeight - 11,
      {
        align: "right",
      }
    );
  }
};

export const generateInvoicePDF = async (order) => {
  if (!order) {
    throw new Error("Order details are required");
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  const orderId = safeText(order.orderId, "ORDER");
  const invoiceNumber = `INV-${orderId}`;

  /*
   * BRAND HEADER
   */
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pageWidth, 36, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(27);
  doc.text("PARIKTA", margin, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "PREMIUM WOMEN'S FASHION",
    margin,
    23
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(
    "TAX INVOICE",
    pageWidth - margin,
    15,
    {
      align: "right",
    }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "www.parikta.com",
    pageWidth - margin,
    22,
    {
      align: "right",
    }
  );

  doc.text(
    "support@parikta.com",
    pageWidth - margin,
    28,
    {
      align: "right",
    }
  );

  /*
   * INVOICE AND ORDER INFORMATION
   */
  doc.setTextColor(...BRAND.dark);

  doc.setFillColor(255, 250, 247);
  doc.setDrawColor(...BRAND.border);
  doc.roundedRect(
    margin,
    44,
    82,
    43,
    3,
    3,
    "FD"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Invoice Details", margin + 5, 53);

  const invoiceInfo = [
    ["Invoice No.", invoiceNumber],
    ["Order ID", orderId],
    ["Order Date", formatDateTime(order.createdAt)],
    [
      "Payment",
      `${safeText(order.paymentMethod)} / ${safeText(
        order.paymentStatus,
        "Pending"
      )}`,
    ],
  ];

  let infoY = 61;

  invoiceInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text(label, margin + 5, infoY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND.dark);

    const wrappedValue = doc.splitTextToSize(
      String(value),
      49
    );

    doc.text(wrappedValue, margin + 30, infoY);

    infoY += 7;
  });

  /*
   * CUSTOMER AND SHIPPING INFORMATION
   */
  const customerX = 103;
  const customerWidth =
    pageWidth - customerX - margin;

  doc.setFillColor(255, 250, 247);
  doc.setDrawColor(...BRAND.border);
  doc.roundedRect(
    customerX,
    44,
    customerWidth,
    43,
    3,
    3,
    "FD"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.dark);
  doc.text(
    "Bill To / Ship To",
    customerX + 5,
    53
  );

  const completeAddress = [
    order.address?.house,
    order.address?.city,
    order.address?.state,
    order.address?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const customerLines = [
    safeText(order.customer?.name),
    safeText(order.customer?.phone),
    order.customer?.email
      ? safeText(order.customer.email)
      : null,
    completeAddress || "-",
  ].filter(Boolean);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND.dark);

  const wrappedCustomerLines =
    customerLines.flatMap((line) =>
      doc.splitTextToSize(
        line,
        customerWidth - 10
      )
    );

  doc.text(
    wrappedCustomerLines,
    customerX + 5,
    61
  );

  /*
   * ITEMS TABLE
   */
  const itemRows = (order.items || []).map(
    (item, index) => {
      const quantity = Number(item.qty || 1);
      const price = Number(item.price || 0);

      return [
        index + 1,
        safeText(item.name),
        safeText(
          item.selectedSize,
          "Free Size"
        ),
        quantity,
        formatMoney(price),
        formatMoney(price * quantity),
      ];
    }
  );

  autoTable(doc, {
    startY: 96,

    margin: {
      left: margin,
      right: margin,
      bottom: 30,
    },

    head: [
      [
        "#",
        "Product",
        "Size",
        "Qty",
        "Unit Price",
        "Amount",
      ],
    ],

    body: itemRows,

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 8.2,
      textColor: BRAND.dark,
      lineColor: BRAND.border,
      lineWidth: 0.2,
      cellPadding: 3.2,
      overflow: "linebreak",
      valign: "middle",
    },

    headStyles: {
      fillColor: BRAND.soft,
      textColor: BRAND.dark,
      fontStyle: "bold",
      halign: "center",
    },

    alternateRowStyles: {
      fillColor: [255, 252, 250],
    },

    columnStyles: {
      0: {
        cellWidth: 9,
        halign: "center",
      },

      1: {
        cellWidth: 66,
      },

      2: {
        cellWidth: 24,
        halign: "center",
      },

      3: {
        cellWidth: 13,
        halign: "center",
      },

      4: {
        cellWidth: 31,
        halign: "right",
      },

      5: {
        cellWidth: 34,
        halign: "right",
      },
    },
  });

  /*
   * PRICE SUMMARY
   */
  let summaryY =
    (doc.lastAutoTable?.finalY || 115) + 10;

  const requiredSummaryHeight = 52;
  const pageHeight = doc.internal.pageSize.getHeight();

  if (
    summaryY + requiredSummaryHeight >
    pageHeight - 25
  ) {
    doc.addPage();
    summaryY = 20;
  }

  const summaryX = 110;
  const summaryWidth =
    pageWidth - summaryX - margin;

  doc.setFillColor(255, 250, 247);
  doc.setDrawColor(...BRAND.border);
  doc.roundedRect(
    summaryX,
    summaryY,
    summaryWidth,
    48,
    3,
    3,
    "FD"
  );

  const subtotal = Number(
    order.subtotal ?? order.amount ?? 0
  );

  const discountAmount = Number(
    order.discountAmount || 0
  );

  const grandTotal = Number(order.amount || 0);

  const summaryRows = [
    ["Subtotal", formatMoney(subtotal)],
    [
      order.couponCode
        ? `Coupon (${order.couponCode})`
        : "Coupon Discount",
      discountAmount > 0
        ? `- ${formatMoney(discountAmount)}`
        : formatMoney(0),
    ],
    ["Shipping Charges", "FREE"],
  ];

  let rowY = summaryY + 10;

  summaryRows.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND.muted);
    doc.text(label, summaryX + 5, rowY);

    doc.setFont("helvetica", "bold");

    if (
      label.startsWith("Coupon") &&
      discountAmount > 0
    ) {
      doc.setTextColor(...BRAND.green);
    } else {
      doc.setTextColor(...BRAND.dark);
    }

    doc.text(
      value,
      pageWidth - margin - 5,
      rowY,
      {
        align: "right",
      }
    );

    rowY += 8;
  });

  doc.setDrawColor(...BRAND.border);
  doc.line(
    summaryX + 5,
    rowY - 3,
    pageWidth - margin - 5,
    rowY - 3
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...BRAND.primary);
  doc.text(
    "Grand Total",
    summaryX + 5,
    rowY + 5
  );

  doc.text(
    formatMoney(grandTotal),
    pageWidth - margin - 5,
    rowY + 5,
    {
      align: "right",
    }
  );

  /*
   * QR CODE AND ORDER TRACKING
   */
  try {
    const qrCode = await createTrackingQr(
      orderId
    );

    doc.addImage(
      qrCode,
      "PNG",
      margin,
      summaryY,
      31,
      31
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.dark);
    doc.text(
      "Track Your Order",
      margin + 36,
      summaryY + 8
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.muted);

    const trackingText =
      "Scan this QR code to view the latest order status.";

    doc.text(
      doc.splitTextToSize(
        trackingText,
        52
      ),
      margin + 36,
      summaryY + 14
    );

    doc.setTextColor(...BRAND.primary);
    doc.text(
      `parikta.com/track-order/${orderId}`,
      margin + 36,
      summaryY + 27
    );
  } catch (error) {
    console.error(
      "Invoice QR generation failed:",
      error
    );
  }

  /*
   * TERMS AND NOTES
   */
  const notesY = summaryY + 58;

  if (notesY < pageHeight - 30) {
    doc.setFillColor(...BRAND.soft);
    doc.roundedRect(
      margin,
      notesY,
      pageWidth - margin * 2,
      18,
      2,
      2,
      "F"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.dark);
    doc.text(
      "Important:",
      margin + 5,
      notesY + 7
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.muted);

    doc.text(
      "Please keep this invoice for returns, exchanges and warranty-related assistance.",
      margin + 5,
      notesY + 13
    );
  }

  addPageFooter(doc);

  const safeOrderId = orderId.replace(
    /[^a-zA-Z0-9-_]/g,
    ""
  );

  doc.save(
    `Parikta-Invoice-${safeOrderId}.pdf`
  );
};