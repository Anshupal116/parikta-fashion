const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { SitemapStream, streamToPromise } = require("sitemap");
const Product = require("./models/Product");

const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const customerRoutes = require("./routes/customerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const couponRoutes = require("./routes/couponRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Parikta Fashion API is running");
});

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);

app.get("/sitemap.xml", async (req, res) => {
  try {
    const smStream = new SitemapStream({
      hostname: "https://www.parikta.com",
    });

    // Static Pages
    smStream.write({
      url: "/",
      changefreq: "daily",
      priority: 1.0,
    });

    smStream.write({
      url: "/products",
      changefreq: "daily",
      priority: 0.9,
    });

    smStream.write({
      url: "/contact",
      changefreq: "monthly",
      priority: 0.7,
    });

    smStream.write({
      url: "/lookbook",
      changefreq: "weekly",
      priority: 0.7,
    });

    smStream.write({
      url: "/customize",
      changefreq: "weekly",
      priority: 0.8,
    });

    // Products from MongoDB
    const products = await Product.find({
      isActive: true,
    });

    products.forEach((product) => {
      smStream.write({
        url: `/product/${product._id}`,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: product.updatedAt,
      });
    });

    smStream.end();

    const sitemap = await streamToPromise(smStream);

    res.header("Content-Type", "application/xml");
    res.send(sitemap.toString());
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});