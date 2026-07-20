const PDFDocument = require("pdfkit");

const formatCurrency = (amount = 0) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const safeText = (value = "") => String(value || "");

const generateInvoicePdf = (order, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 45,
    bufferPages: true,
  });

  const invoiceNumber = `INV-${order.orderId}`;
  const invoiceDate = new Date(
    order.paidAt || order.createdAt || Date.now()
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const customerAddress = [
    order?.address?.house,
    order?.address?.city,
    order?.address?.state,
    order?.address?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${invoiceNumber}.pdf"`
  );

  doc.pipe(res);

  // =====================================
  // HEADER
  // =====================================

  doc
    .rect(0, 0, doc.page.width, 105)
    .fill("#2D211D");

  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(24)
    .text("PARIKTA FASHION", 45, 35);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#D8CBC4")
    .text(
      "Elegant fashion, thoughtfully delivered.",
      45,
      68
    );

  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("TAX INVOICE", 390, 38, {
      width: 160,
      align: "right",
    });

  // =====================================
  // INVOICE DETAILS
  // =====================================

  let y = 135;

  doc
    .fillColor("#2D211D")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("INVOICE DETAILS", 45, y);

  y += 20;

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#4B403B")
    .text(`Invoice No: ${invoiceNumber}`, 45, y)
    .text(`Invoice Date: ${invoiceDate}`, 45, y + 16)
    .text(`Order ID: ${safeText(order.orderId)}`, 45, y + 32);

  doc
    .text(
      `Payment Method: ${safeText(order.paymentMethod)}`,
      340,
      y
    )
    .text(
      `Payment Status: ${safeText(order.paymentStatus)}`,
      340,
      y + 16
    )
    .text(
      `Order Status: ${safeText(order.status)}`,
      340,
      y + 32
    );

  y += 75;

  doc
    .moveTo(45, y)
    .lineTo(550, y)
    .strokeColor("#DDD4CF")
    .stroke();

  // =====================================
  // CUSTOMER DETAILS
  // =====================================

  y += 22;

  doc
    .fillColor("#2D211D")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("BILL TO / SHIP TO", 45, y);

  y += 20;

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      safeText(order?.customer?.name || "Customer"),
      45,
      y
    );

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#4B403B")
    .text(
      `Phone: ${safeText(order?.customer?.phone)}`,
      45,
      y + 18
    )
    .text(
      `Email: ${safeText(
        order?.customer?.email || "Not provided"
      )}`,
      45,
      y + 34
    )
    .text(
      customerAddress || "Address not available",
      45,
      y + 52,
      {
        width: 500,
        lineGap: 3,
      }
    );

  y += 100;

  // =====================================
  // ITEMS TABLE HEADER
  // =====================================

  const tableTop = y;

  doc
    .rect(45, tableTop, 505, 30)
    .fill("#8C3F31");

  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("ITEM", 55, tableTop + 10, {
      width: 210,
    })
    .text("SIZE", 275, tableTop + 10, {
      width: 65,
      align: "center",
    })
    .text("QTY", 345, tableTop + 10, {
      width: 45,
      align: "center",
    })
    .text("PRICE", 395, tableTop + 10, {
      width: 70,
      align: "right",
    })
    .text("TOTAL", 475, tableTop + 10, {
      width: 65,
      align: "right",
    });

  y = tableTop + 40;

  // =====================================
  // ITEMS ROWS
  // =====================================

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  items.forEach((item, index) => {
    const rowHeight = 42;

    if (y + rowHeight > 720) {
      doc.addPage();
      y = 50;

      doc
        .rect(45, y, 505, 30)
        .fill("#8C3F31");

      doc
        .fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("ITEM", 55, y + 10, {
          width: 210,
        })
        .text("SIZE", 275, y + 10, {
          width: 65,
          align: "center",
        })
        .text("QTY", 345, y + 10, {
          width: 45,
          align: "center",
        })
        .text("PRICE", 395, y + 10, {
          width: 70,
          align: "right",
        })
        .text("TOTAL", 475, y + 10, {
          width: 65,
          align: "right",
        });

      y += 40;
    }

    if (index % 2 === 0) {
      doc
        .rect(45, y - 7, 505, rowHeight)
        .fill("#FAF7F5");
    }

    const quantity = Number(item.qty || 1);
    const price = Number(item.price || 0);
    const total = quantity * price;

    doc
      .fillColor("#2D211D")
      .font("Helvetica")
      .fontSize(9)
      .text(safeText(item.name), 55, y, {
        width: 205,
        height: 30,
        ellipsis: true,
      })
      .text(
        safeText(item.selectedSize || "Free Size"),
        275,
        y,
        {
          width: 65,
          align: "center",
        }
      )
      .text(String(quantity), 345, y, {
        width: 45,
        align: "center",
      })
      .text(formatCurrency(price), 395, y, {
        width: 70,
        align: "right",
      })
      .text(formatCurrency(total), 475, y, {
        width: 65,
        align: "right",
      });

    y += rowHeight;
  });

  // =====================================
  // TOTAL SUMMARY
  // =====================================

  y += 15;

  if (y > 650) {
    doc.addPage();
    y = 60;
  }

  const summaryX = 335;

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#4B403B")
    .text("Subtotal", summaryX, y, {
      width: 100,
    })
    .text(formatCurrency(order.subtotal), 455, y, {
      width: 95,
      align: "right",
    });

  y += 22;

  if (Number(order.discountAmount || 0) > 0) {
    doc
      .fillColor("#217A3C")
      .text("Discount", summaryX, y, {
        width: 100,
      })
      .text(
        `-${formatCurrency(order.discountAmount)}`,
        455,
        y,
        {
          width: 95,
          align: "right",
        }
      );

    y += 22;
  }

  doc
    .moveTo(summaryX, y)
    .lineTo(550, y)
    .strokeColor("#DDD4CF")
    .stroke();

  y += 12;

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#8C3F31")
    .text("Grand Total", summaryX, y, {
      width: 110,
    })
    .text(formatCurrency(order.amount), 455, y, {
      width: 95,
      align: "right",
    });

  // =====================================
  // FOOTER
  // =====================================

  const footerY = 760;

  doc
    .moveTo(45, footerY)
    .lineTo(550, footerY)
    .strokeColor("#DDD4CF")
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#786A64")
    .text(
      "Thank you for shopping with Parikta Fashion.",
      45,
      footerY + 14,
      {
        width: 505,
        align: "center",
      }
    )
    .text(
      "For support, contact support@parikta.com",
      45,
      footerY + 27,
      {
        width: 505,
        align: "center",
      }
    );

  // =====================================
  // PAGE NUMBERS
  // =====================================

  const range = doc.bufferedPageRange();

  for (
    let pageIndex = range.start;
    pageIndex < range.start + range.count;
    pageIndex += 1
  ) {
    doc.switchToPage(pageIndex);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#8D817B")
      .text(
        `Page ${pageIndex + 1} of ${range.count}`,
        45,
        810,
        {
          width: 505,
          align: "right",
        }
      );
  }

  doc.end();
};

module.exports = generateInvoicePdf;