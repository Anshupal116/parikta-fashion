import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiCheck,
  FiChevronRight,
  FiShoppingBag,
  FiZoomIn,
  FiX,
  FiMapPin,
  FiShare2,
  FiCopy,
  FiShield,
  FiRefreshCw,
  FiCreditCard,
  FiTruck,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import Container from "../components/Container";
import SEO from "../components/SEO";
import RatingStars from "../components/reviews/RatingStars";
import ReviewSummary from "../components/reviews/ReviewSummary";
import ReviewCard from "../components/reviews/ReviewCard";
import WriteReviewModal from "../components/reviews/WriteReviewModal";

import { useCart } from "../context/CartContext";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";
import { useCustomer } from "../context/CustomerContext";

import {
  getProductById,
  getProducts,
} from "../services/productService";
import {
  getProductReviews,
  checkReviewEligibility,
} from "../services/reviewService";

const sizes = ["S", "M", "L", "XL", "XXL"];

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { addRecentlyViewed } = useRecentlyViewed();
  const { token, isLoggedIn } = useCustomer();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");

  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setProduct(null);
        setSelectedSize("");

        const response = await getProductById(id);

        if (!active) return;

        if (!response?.success || !response?.product) {
          setProduct(null);
          return;
        }

        const productData = response.product;

        setProduct(productData);
        setMainImage(productData.image || "");

        addRecentlyViewed({
          ...productData,
          id: productData._id,
        });

        try {
          const allProducts = await getProducts();

          if (!active) return;

          const productsList = Array.isArray(allProducts)
            ? allProducts
            : [];

          const related = productsList
            .filter((item) => item._id !== productData._id)
            .filter(
              (item) =>
                item.category === productData.category ||
                item.type === productData.type
            )
            .slice(0, 4);

          setSimilarProducts(related);
        } catch (relatedError) {
          console.error(
            "Similar products load error:",
            relatedError
          );

          if (active) {
            setSimilarProducts([]);
          }
        }
      } catch (error) {
        console.error("Product load error:", error);

        if (active) {
          setProduct(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);

      const response = await getProductReviews(id);

      if (response.success) {
        setReviews(response.reviews || []);
        setAverageRating(Number(response.averageRating || 0));
        setTotalReviews(Number(response.totalReviews || 0));
        setRatingBreakdown(
          response.ratingBreakdown || {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          }
        );
      }
    } catch (error) {
      console.error("Reviews load error:", error);
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
      setRatingBreakdown({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadReviewEligibility = async () => {
    if (!isLoggedIn || !token) {
      setReviewEligibility(null);
      return;
    }

    try {
      const response = await checkReviewEligibility(id);
      setReviewEligibility(response);
    } catch (error) {
      console.error("Review eligibility error:", error);
      setReviewEligibility(null);
    }
  };

  useEffect(() => {
    loadReviews();
    loadReviewEligibility();
  }, [id, isLoggedIn, token]);

  const handleOpenReviewModal = () => {
    if (!isLoggedIn || !token) {
      navigate("/login", {
        state: { from: `/product/${id}` },
      });
      return;
    }

    if (!reviewEligibility?.eligible && !reviewEligibility?.alreadyReviewed) {
      alert(
        reviewEligibility?.message ||
          "Review is available after product delivery"
      );
      return;
    }

    setReviewModalOpen(true);
  };

  const handleReviewSuccess = async () => {
    await Promise.all([loadReviews(), loadReviewEligibility()]);
  };

  if (loading) {
    return (
      <>
        <SEO
          title="Loading Product | Parikta Fashion"
          description="Loading product details from Parikta Fashion."
          canonical={`https://www.parikta.com/product/${id}`}
          noIndex
        />

        <Navbar />

        <main className="min-h-screen bg-[#fffaf7] flex items-center justify-center">
          <div className="rounded-2xl border border-[#eadbd4] bg-white/70 px-2 py-3 text-center sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            <div className="w-12 h-12 border-4 border-[#eadbd4] border-t-[#9A3F4D] rounded-full animate-spin mx-auto" />

            <h1 className="heading-font text-4xl text-[#5B3B32] mt-5">
              Loading Product...
            </h1>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (!product) {
  return (
    <>
      <SEO
        title="Product Not Found | Parikta Fashion"
        description="The requested product could not be found at Parikta Fashion."
        canonical={`https://www.parikta.com/product/${id}`}
        noIndex
      />

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7] flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="heading-font text-5xl text-[#5B3B32]">
            Product Not Found
          </h1>

          <Link
            to="/products"
            className="inline-block mt-6 bg-[#9A3F4D] text-white px-8 py-4 rounded-xl font-bold"
          >
            Back To Collection
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}

const productUrl = `https://www.parikta.com/product/${product._id}`;

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",

  name: product.name,

  image: [
    product.image,
    product.hoverImage,
    product.galleryImages?.front,
    product.galleryImages?.back,
    product.galleryImages?.side,
    product.galleryImages?.closeUp,
    product.galleryImages?.modelPose,
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean),

  description:
    product.description ||
    `Shop ${product.name} online at Parikta Fashion.`,

  sku: product.sku || product._id,

  brand: {
    "@type": "Brand",
    name: "Parikta Fashion",
  },

  offers: {
    "@type": "Offer",
    url: productUrl,
    priceCurrency: "INR",
    price: Number(product.price),
    availability:
      Number(product.stock) > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
  },

  ...(totalReviews > 0
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: averageRating,
          reviewCount: totalReviews,
          bestRating: 5,
          worstRating: 1,
        },
      }
    : {}),
};

  const galleryImages = [
    product.image,
    product.hoverImage,

    product.galleryImages?.front,
    product.galleryImages?.back,
    product.galleryImages?.side,
    product.galleryImages?.closeUp,
    product.galleryImages?.modelPose,

    ...(Array.isArray(product.images)
      ? product.images
      : []),
  ].filter(Boolean);

  const uniqueGalleryImages = [...new Set(galleryImages)];

  const handleAddToCart = () => {
    if (Number(product.stock) <= 0) {
      alert("Product out of stock hai");
      return;
    }

    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    addToCart({
      ...product,
      id: product._id,
      selectedSize,
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (Number(product.stock) <= 0) {
      alert("Product out of stock hai");
      return;
    }

    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    addToCart({
      ...product,
      id: product._id,
      selectedSize,
    });

    navigate("/checkout");
  };

  const openLightbox = (image) => {
    setLightboxImage(image);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage("");
  };

  const handleCheckDelivery = () => {
    const cleanPincode = pincode.trim();

    if (!/^\d{6}$/.test(cleanPincode)) {
      setDeliveryMessage("Please enter a valid 6-digit pincode");
      return;
    }

    const deliveryText = shipping.deliveryDays || "5-7";
    const deliveryNumbers = String(deliveryText).match(/\d+/g) || ["5"];
    const maximumDays = Number(deliveryNumbers[deliveryNumbers.length - 1] || 5);

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + maximumDays);

    setDeliveryMessage(
      `Estimated delivery in ${deliveryText} days, by ${estimatedDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )}`
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Copy link error:", error);
      alert("Link copy nahi hua");
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Check out ${product.name} at Parikta Fashion: ${productUrl}`
    );

    window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
  };

  const featureItems = [
    ["Premium", "Quality"],
    ["Lightweight", "Fabric"],
    ["Elegant", "Design"],
    ["Perfect For", "Occasions"],
  ];

  const specifications = product.specifications || {};
  const shipping = product.shipping || {};
  const sizeStock = product.sizeStock || {};

  const productDetails = [
    ["Fabric", specifications.fabric || product.fabric],
    ["Color", product.color],
    ["Work", specifications.work || product.work],
    ["Occasion", specifications.occasion || product.occasion],
    ["Sleeve", specifications.sleeve],
    ["Neck", specifications.neck],
    ["Fit", specifications.fit],
    ["Length", specifications.length],
    ["Pattern", specifications.pattern],
    ["Package Contains", specifications.packageContains],
    ["Country of Origin", specifications.countryOfOrigin],
    ["Category", product.category],
    ["Type", product.type],
    ["SKU", product.sku],
  ].filter(([, value]) => value !== undefined && value !== null && String(value).trim());

  const availableSizes = Object.keys(sizeStock).length
    ? Object.entries(sizeStock)
        .filter(([, quantity]) => Number(quantity) > 0)
        .map(([size]) => size)
    : sizes;

  const careInstructions =
    specifications.care || product.care || "Care instructions not provided.";

  const trustFeatures = [
    shipping.freeShipping !== false && [FiTruck, "Free Shipping"],
    shipping.returnAvailable !== false && [FiRefreshCw, "Easy Returns"],
    shipping.codAvailable !== false && [FiCreditCard, "COD Available"],
  ].filter(Boolean);

  return (
    <>
      <SEO
        title={
          product.seo?.metaTitle ||
          `${product.name} | Parikta Fashion`
        }
        description={
          product.seo?.metaDescription ||
          (product.description
            ? product.description.slice(0, 160)
            : `Shop ${product.name} online at Parikta Fashion. Premium women's designer wear with elegant styling.`)
        }
        canonical={productUrl}
        image={product.image}
        type="product"
        structuredData={productSchema}
      />

      <Navbar />

      <main className="min-h-screen bg-[#fffaf7] pb-28 md:pb-0">
        <section className="py-4 sm:py-6 md:py-10">
          <Container>
            {/* Breadcrumb */}
            <div className="mb-4 flex w-full max-w-full touch-pan-x items-center gap-2 overflow-x-auto overscroll-x-contain whitespace-nowrap pb-1 text-[11px] text-[#5B3B32] sm:mb-6 md:text-sm scrollbar-hide">
              <Link
                to="/"
                className="hover:text-[#9A3F4D]"
              >
                Home
              </Link>

              <FiChevronRight className="text-[#BFA996]" />

              <Link
                to="/products"
                className="hover:text-[#9A3F4D]"
              >
                {product.category || "Collection"}
              </Link>

              <FiChevronRight className="text-[#BFA996]" />

              <span className="text-[#9A3F4D]">
                {product.name}
              </span>
            </div>

            <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,55%)_minmax(0,45%)] lg:gap-14">
              {/* LEFT PRODUCT IMAGES */}
              <div className="min-w-0 max-w-full overflow-hidden">
                <div className="group relative w-full max-w-full overflow-hidden rounded-[22px] bg-[#f2ece8] sm:rounded-[28px]">
                  <img
                    src={mainImage || product.image}
                    alt={product.name}
                    className="block h-[480px] w-full max-w-full object-cover object-top transition-transform duration-700 sm:h-[620px] md:h-[760px] group-hover:scale-[1.025]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      openLightbox(
                        mainImage || product.image
                      )
                    }
                    className="absolute right-3 top-3 flex h-11 w-11 touch-manipulation items-center justify-center rounded-full bg-white/95 text-[#5B3B32] shadow-lg transition active:scale-95 hover:bg-[#9A3F4D] hover:text-white sm:right-4 sm:top-4 sm:h-12 sm:w-12"
                  >
                    <FiZoomIn size={21} />
                  </button>
                </div>

                {uniqueGalleryImages.length > 1 && (
                  <div
                    className={`mt-3 flex w-full max-w-full touch-pan-x snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-2 [-webkit-overflow-scrolling:touch] sm:grid sm:overflow-visible sm:overscroll-auto sm:pb-0 md:gap-3 ${
                      uniqueGalleryImages.length >= 5
                        ? "sm:grid-cols-4 md:grid-cols-5"
                        : "sm:grid-cols-4"
                    }`}
                  >
                    {uniqueGalleryImages.map(
                      (image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() =>
                            setMainImage(image)
                          }
                          className={`h-24 w-20 min-w-20 shrink-0 snap-start touch-manipulation overflow-hidden rounded-xl border-2 bg-[#f2ece8] transition active:scale-[0.98] sm:h-28 sm:w-auto sm:min-w-0 sm:shrink md:h-44 ${
                            mainImage === image
                              ? "border-[#9A3F4D]"
                              : "border-transparent hover:border-[#d8a59c]"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${
                              index + 1
                            }`}
                            className="w-full h-full object-cover object-top"
                          />
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT PRODUCT DETAILS */}
              <div className="min-w-0 max-w-full lg:sticky lg:top-28">
                {product.badge && (
                  <span className="inline-block rounded-full bg-[#efd8d4] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#4f2923]">
                    {product.badge}
                  </span>
                )}

                <h1 className="heading-font mt-4 break-words text-[2.7rem] leading-[0.98] text-[#59291f] sm:text-5xl md:text-6xl lg:text-7xl">
                  {product.name}
                </h1>

                <p className="mt-3 text-base text-[#2f2927] sm:mt-4 sm:text-lg md:text-xl">
                  {product.color
                    ? `${product.color} ${
                        product.category || ""
                      }`
                    : product.category ||
                      product.type}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <RatingStars
                    value={averageRating}
                    readOnly
                    size={20}
                  />

                  <a
                    href="#customer-reviews"
                    className="text-sm font-semibold text-[#9A3F4D] hover:underline"
                  >
                    {totalReviews > 0
                      ? `${averageRating.toFixed(1)} (${totalReviews} review${
                          totalReviews === 1 ? "" : "s"
                        })`
                      : "No reviews yet"}
                  </a>
                </div>

                <div className="mt-5 flex min-w-0 flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-full border border-[#eadbd4] bg-white px-4 py-2 text-sm font-semibold text-[#5B3B32] transition active:scale-[0.98] hover:border-[#9A3F4D]"
                  >
                    <FiShare2 />
                    WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-full border border-[#eadbd4] bg-white px-4 py-2 text-sm font-semibold text-[#5B3B32] transition active:scale-[0.98] hover:border-[#9A3F4D]"
                  >
                    <FiCopy />
                    {copied ? "Copied" : "Copy Link"}
                  </button>
                </div>

                <div className="flex flex-wrap items-end gap-3 mt-5">
                  <span className="text-3xl font-semibold text-[#9A213A] sm:text-4xl">
                    ₹
                    {Number(
                      product.price
                    ).toLocaleString("en-IN")}
                  </span>

                  {Number(product.mrp) >
                    Number(product.price) && (
                    <span className="text-lg text-gray-400 line-through pb-1">
                      ₹
                      {Number(
                        product.mrp
                      ).toLocaleString("en-IN")}
                    </span>
                  )}

                  {product.discount && (
                    <span className="text-sm text-green-700 font-bold pb-1">
                      {product.discount}
                    </span>
                  )}
                </div>

                <p className="text-[#7f7570] mt-2">
                  Inclusive of all taxes
                </p>

                <div className="flex items-center gap-3 my-7">
                  <span className="h-px bg-[#d8b079] flex-1" />
                  <span className="text-[#c9934c]">
                    ◇◇
                  </span>
                  <span className="h-px bg-[#d8b079] flex-1" />
                </div>

                <p className="text-[15px] leading-7 text-[#292321] sm:text-base">
                  {product.description}
                </p>

                {/* Premium Features */}
                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
                  {featureItems.map(
                    ([title, subtitle]) => (
                      <div
                        key={`${title}-${subtitle}`}
                        className="text-center"
                      >
                        <div className="w-11 h-11 mx-auto rounded-full border border-[#b87968] text-[#7f372b] flex items-center justify-center">
                          <FiCheck size={20} />
                        </div>

                        <p className="text-[10px] md:text-xs text-[#59291f] mt-2 leading-4">
                          {title}
                          <br />
                          {subtitle}
                        </p>
                      </div>
                    )
                  )}
                </div>

                {/* Size Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm md:text-base tracking-[0.12em] uppercase font-bold text-[#292321]">
                      Select Size
                    </h3>

                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="text-sm text-[#59291f] underline underline-offset-4"
                    >
                      Size Guide
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-5 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
                    {availableSizes.length > 0 ? (
                      availableSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`relative aspect-square min-h-12 w-full touch-manipulation rounded-xl border font-semibold transition active:scale-95 sm:h-14 sm:w-14 md:h-16 md:w-16 ${
                            selectedSize === size
                              ? "border-[#9A213A] bg-[#9A213A] text-white"
                              : "border-[#d8cbc4] bg-white text-[#292321] hover:border-[#9A213A]"
                          }`}
                        >
                          {size}
                          {Object.keys(sizeStock).length > 0 && (
                            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium text-[#8b746b]">
                              {Number(sizeStock[size] || 0)} left
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="col-span-5 text-sm font-semibold text-red-600">
                        No size currently available.
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-7 hidden space-y-3 md:block">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={Number(product.stock) <= 0}
                    className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#9A213A] py-4 font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#7d1930] disabled:opacity-50"
                  >
                    <FiShoppingBag size={20} />

                    {Number(product.stock) > 0
                      ? "Add To Cart"
                      : "Out Of Stock"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={Number(product.stock) <= 0}
                    className="min-h-14 w-full rounded-xl border border-[#9A213A] py-4 font-bold uppercase tracking-[0.1em] text-[#9A213A] transition hover:bg-[#fff1f3] disabled:opacity-50"
                  >
                    Buy Now
                  </button>
                </div>

                {added && (
                  <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-semibold text-sm">
                    Product added to cart successfully.
                  </div>
                )}

                <p className="text-sm mt-4 text-[#5B3B32]">
                  Availability:{" "}
                  <span
                    className={`font-bold ${
                      Number(product.stock) > 0
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {Number(product.stock) > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </span>
                </p>

                <div className="mt-7 rounded-2xl border border-[#eadbd4] bg-white p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-[#5B3B32] font-bold">
                    <FiMapPin />
                    Check Delivery
                  </div>

                  <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={pincode}
                      onChange={(event) => {
                        setPincode(event.target.value.replace(/\D/g, ""));
                        setDeliveryMessage("");
                      }}
                      placeholder="Enter 6-digit pincode"
                      className="flex-1 min-w-0 border border-[#eadbd4] rounded-xl px-4 py-3 outline-none focus:border-[#9A3F4D]"
                    />

                    <button
                      type="button"
                      onClick={handleCheckDelivery}
                      className="min-h-12 rounded-xl bg-[#5B3B32] px-4 py-3 text-sm font-semibold text-white sm:px-5"
                    >
                      Check
                    </button>
                  </div>

                  {deliveryMessage && (
                    <p
                      className={`text-sm mt-3 ${
                        deliveryMessage.startsWith("Estimated")
                          ? "text-green-700"
                          : "text-red-600"
                      }`}
                    >
                      {deliveryMessage}
                    </p>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    [FiShield, "Secure Payment"],
                    ...trustFeatures,
                  ].map(([Icon, label]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-[#eadbd4] bg-[#FDEAE6] px-2 py-3 text-center sm:p-4"
                    >
                      <Icon className="mx-auto text-[#9A3F4D]" size={20} />
                      <p className="text-[10px] md:text-xs text-[#5B3B32] font-semibold mt-2">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Product Details */}
                <div className="mt-9">
                  <div className="flex items-center gap-4 mb-5">
                    <h2 className="text-base tracking-[0.12em] uppercase font-bold text-[#292321] whitespace-nowrap">
                      Product Details
                    </h2>

                    <span className="h-px bg-[#d8b079] flex-1" />
                  </div>

                  <ul className="space-y-2 text-sm md:text-base text-[#302a27]">
                    {productDetails.map(
                      ([label, value]) => (
                        <li
                          key={label}
                          className="flex items-start gap-2"
                        >
                          <span className="mt-2 w-1 h-1 bg-[#59291f] rounded-full shrink-0" />

                          <span>
                            <strong>{label}:</strong>{" "}
                            {value}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Care Instructions */}
                <div className="mt-9">
                  <div className="flex items-center gap-4 mb-5">
                    <h2 className="text-base tracking-[0.12em] uppercase font-bold text-[#292321] whitespace-nowrap">
                      Care Instructions
                    </h2>

                    <span className="h-px bg-[#d8b079] flex-1" />
                  </div>

                  <div className="rounded-2xl border border-[#eadbd4] bg-[#f7f2ee] p-4 sm:p-5">
                    <p className="text-sm leading-7 text-[#302a27]">
                      {careInstructions}
                    </p>
                  </div>
                </div>

                <div className="mt-9 border-t border-[#eadbd4]">
                  <details className="border-b border-[#eadbd4] py-5">
                    <summary className="cursor-pointer font-bold text-[#59291f] flex justify-between">
                      Shipping & Returns
                      <span>+</span>
                    </summary>

                    <div className="mt-3 space-y-2 text-sm leading-7 text-[#6d554d]">
                      <p>
                        Estimated delivery:{" "}
                        <strong>{shipping.deliveryDays || "5-7"} days</strong>
                      </p>
                      <p>
                        Shipping:{" "}
                        <strong>
                          {shipping.freeShipping === false
                            ? "Shipping charges may apply"
                            : "Free shipping available"}
                        </strong>
                      </p>
                      <p>
                        Cash on delivery:{" "}
                        <strong>
                          {shipping.codAvailable === false
                            ? "Not available"
                            : "Available"}
                        </strong>
                      </p>
                      <p>
                        Returns:{" "}
                        <strong>
                          {shipping.returnAvailable === false
                            ? "Not available"
                            : "Available on eligible orders"}
                        </strong>
                      </p>
                    </div>
                  </details>

                  <details className="border-b border-[#eadbd4] py-5">
                    <summary className="cursor-pointer font-bold text-[#59291f] flex justify-between">
                      Product Disclaimer
                      <span>+</span>
                    </summary>

                    <p className="text-sm text-[#6d554d] leading-7 mt-3">
                      Actual product colour may vary
                      slightly because of photography,
                      lighting and screen settings.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section
          id="customer-reviews"
          className="border-t border-[#eadbd4] bg-[#fffaf7] py-10 sm:py-12 md:py-16"
        >
          <Container>
            <div className="mb-7 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between md:gap-5">
              <div>
                <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996]">
                  Real Customer Experience
                </p>

                <h2 className="heading-font mt-2 text-[2.15rem] leading-tight text-[#5B3B32] sm:text-4xl md:text-5xl">
                  Ratings & Reviews
                </h2>
              </div>

              <button
                type="button"
                onClick={handleOpenReviewModal}
                className="min-h-12 w-full rounded-xl bg-[#9A3F4D] px-6 py-3 font-semibold text-white sm:w-auto"
              >
                {reviewEligibility?.alreadyReviewed
                  ? "Edit Your Review"
                  : "Write A Review"}
              </button>
            </div>

            <ReviewSummary
              averageRating={averageRating}
              totalReviews={totalReviews}
              ratingBreakdown={ratingBreakdown}
            />

            <div className="mt-8">
              {reviewsLoading ? (
                <div className="text-center py-12 text-[#8b746b]">
                  Loading reviews...
                </div>
              ) : reviews.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#eadbd4] rounded-3xl p-10 text-center">
                  <h3 className="heading-font text-3xl text-[#5B3B32]">
                    No Reviews Yet
                  </h3>

                  <p className="text-[#8b746b] mt-3">
                    Be the first verified customer to review this product.
                  </p>
                </div>
              )}
            </div>
          </Container>
        </section>

        {similarProducts.length > 0 && (
          <section className="border-t border-[#eadbd4] bg-[#f7f2ee] py-10 sm:py-12 md:py-16">
            <Container>
              <div className="mb-6 flex items-end justify-between gap-3 sm:mb-8">
                <div>
                  <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996]">
                    You May Also Like
                  </p>

                  <h2 className="heading-font mt-1 text-[2rem] leading-tight text-[#5B3B32] sm:text-4xl md:text-5xl">
                    Similar Styles
                  </h2>
                </div>

                <Link
                  to="/products"
                  className="text-xs tracking-[0.18em] uppercase text-[#9A3F4D] font-bold"
                >
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 md:gap-7">
                {similarProducts.map((item) => (
                  <ProductCard
                    key={item._id}
                    item={item}
                  />
                ))}
              </div>
            </Container>
          </section>
        )}
      </main>

      {/* Mobile Sticky Purchase Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-50 border-t border-[#eadbd4] bg-[#fffaf7]/96 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(91,59,50,0.12)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-[auto_1fr_1fr] items-center gap-2.5">
          <div className="min-w-[72px] shrink-0">
            <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#8b746b]">
              Total
            </p>
            <p className="text-base font-bold text-[#9A213A]">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={Number(product.stock) <= 0}
            className="min-h-12 rounded-xl border border-[#9A213A] px-2 py-3 text-[9px] font-bold uppercase tracking-[0.08em] text-[#9A213A] active:scale-[0.98] disabled:opacity-50"
          >
            Add To Cart
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={Number(product.stock) <= 0}
            className="min-h-12 rounded-xl bg-[#9A213A] px-2 py-3 text-[9px] font-bold uppercase tracking-[0.08em] text-white active:scale-[0.98] disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>
      </div>

      {sizeGuideOpen && (
        <div
          className="fixed inset-0 z-[10050] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setSizeGuideOpen(false)}
        >
          <div
            className="max-h-[88dvh] w-full max-w-2xl overflow-hidden rounded-t-[28px] bg-[#fffaf7] shadow-2xl sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#eadbd4]">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-[#BFA996]">
                  Find Your Fit
                </p>
                <h2 className="heading-font text-3xl text-[#5B3B32] mt-1">
                  Size Guide
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="w-10 h-10 rounded-full bg-[#FDEAE6] flex items-center justify-center text-[#5B3B32]"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="max-h-[calc(88dvh-92px)] overflow-auto p-5 sm:p-6">
              <table className="w-full min-w-[560px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#FDEAE6] text-[#5B3B32]">
                    <th className="p-3">Size</th>
                    <th className="p-3">Bust</th>
                    <th className="p-3">Waist</th>
                    <th className="p-3">Hip</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["S", "34 in", "28 in", "36 in"],
                    ["M", "36 in", "30 in", "38 in"],
                    ["L", "38 in", "32 in", "40 in"],
                    ["XL", "40 in", "34 in", "42 in"],
                    ["XXL", "42 in", "36 in", "44 in"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-b border-[#eadbd4]">
                      {row.map((cell) => (
                        <td key={cell} className="p-3 text-[#5B3B32]">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="text-sm text-[#8b746b] leading-6 mt-5">
                Measurements are body measurements. For custom fitting, contact Parikta Fashion before placing the order.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxOpen && lightboxImage && (
        <div className="fixed inset-0 z-[10060] flex items-center justify-center bg-black/90 p-3 sm:p-5">
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-lg sm:right-5 sm:top-5 sm:h-12 sm:w-12"
          >
            <FiX size={25} />
          </button>

          <img
            src={lightboxImage}
            alt={product.name}
            className="max-h-[92dvh] max-w-full object-contain"
          />
        </div>
      )}

      <WriteReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        productId={product._id}
        existingReview={
          reviewEligibility?.alreadyReviewed
            ? reviewEligibility.review
            : null
        }
        onSuccess={handleReviewSuccess}
      />

      <Footer />
    </>
  );
}

export default ProductDetails;