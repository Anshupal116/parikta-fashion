import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiCheck,
  FiChevronRight,
  FiShoppingBag,
  FiZoomIn,
  FiX,
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
          <div className="text-center">
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

  const featureItems = [
    ["Premium", "Quality"],
    ["Lightweight", "Fabric"],
    ["Elegant", "Design"],
    ["Perfect For", "Occasions"],
  ];

  const productDetails = [
    ["Fabric", product.fabric || "Premium Fabric"],
    [
      "Color",
      product.color || "As shown in product image",
    ],
    [
      "Work",
      product.work || "Designer embroidery work",
    ],
    [
      "Category",
      product.category || "Designer Wear",
    ],
    ["Type", product.type || "Ready-made"],
    [
      "Occasion",
      product.occasion ||
        "Wedding, Party, Festive and Reception",
    ],
  ];

  return (
    <>
      <SEO
        title={`${product.name} | Parikta Fashion`}
        description={
          product.description
            ? product.description.slice(0, 160)
            : `Shop ${product.name} online at Parikta Fashion. Premium women's designer wear with elegant styling.`
        }
        canonical={productUrl}
        image={product.image}
        type="product"
        structuredData={productSchema}
      />

      <Navbar />

      <main className="bg-[#fffaf7] min-h-screen pb-24 md:pb-0">
        <section className="py-5 md:py-10">
          <Container>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#5B3B32] mb-6 overflow-x-auto whitespace-nowrap">
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

            <div className="grid lg:grid-cols-[55%_45%] gap-8 lg:gap-14 items-start">
              {/* LEFT PRODUCT IMAGES */}
              <div>
                <div className="relative bg-[#f2ece8] overflow-hidden group">
                  <img
                    src={mainImage || product.image}
                    alt={product.name}
                    className="w-full h-[500px] md:h-[760px] object-cover object-top transition-transform duration-700 group-hover:scale-[1.025]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      openLightbox(
                        mainImage || product.image
                      )
                    }
                    className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-[#5B3B32] hover:bg-[#9A3F4D] hover:text-white transition"
                  >
                    <FiZoomIn size={21} />
                  </button>
                </div>

                {uniqueGalleryImages.length > 1 && (
                  <div
                    className={`grid gap-2 md:gap-3 mt-3 ${
                      uniqueGalleryImages.length >= 5
                        ? "grid-cols-4 md:grid-cols-5"
                        : "grid-cols-4"
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
                          className={`overflow-hidden h-28 md:h-44 border-2 bg-[#f2ece8] transition ${
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
              <div className="lg:sticky lg:top-28">
                {product.badge && (
                  <span className="inline-block bg-[#efd8d4] text-[#4f2923] px-4 py-2 text-[10px] tracking-[0.14em] uppercase font-bold rounded-md">
                    {product.badge}
                  </span>
                )}

                <h1 className="heading-font text-5xl md:text-6xl lg:text-7xl text-[#59291f] leading-[0.94] mt-4">
                  {product.name}
                </h1>

                <p className="text-lg md:text-xl text-[#2f2927] mt-4">
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

                <div className="flex flex-wrap items-end gap-3 mt-5">
                  <span className="text-3xl md:text-4xl font-semibold text-[#9A213A]">
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

                <p className="text-[#292321] leading-7 text-base">
                  {product.description}
                </p>

                {/* Premium Features */}
                <div className="grid grid-cols-4 gap-2 mt-7">
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
                      className="text-sm text-[#59291f] underline underline-offset-4"
                    >
                      Size Guide
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          setSelectedSize(size)
                        }
                        className={`w-14 h-14 md:w-16 border rounded-md font-medium transition ${
                          selectedSize === size
                            ? "bg-[#9A213A] text-white border-[#9A213A]"
                            : "bg-white text-[#292321] border-[#d8cbc4] hover:border-[#9A213A]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3 mt-7">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={Number(product.stock) <= 0}
                    className="w-full bg-[#9A213A] text-white py-4 rounded-md font-bold tracking-[0.1em] uppercase flex items-center justify-center gap-3 hover:bg-[#7d1930] disabled:opacity-50"
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
                    className="w-full border border-[#9A213A] text-[#9A213A] py-4 rounded-md font-bold tracking-[0.1em] uppercase hover:bg-[#fff1f3] disabled:opacity-50"
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

                  <div className="grid grid-cols-4 gap-3 text-center">
                    {[
                      ["◫", "Dry Clean", "Only"],
                      ["△", "Do Not", "Bleach"],
                      [
                        "▱",
                        "Iron At Low",
                        "Temperature",
                      ],
                      ["⌂", "Store In Dry", "Place"],
                    ].map(
                      ([icon, title, subtitle]) => (
                        <div key={title}>
                          <div className="text-3xl text-[#7f372b]">
                            {icon}
                          </div>

                          <p className="text-[10px] md:text-xs text-[#302a27] leading-4 mt-2">
                            {title}
                            <br />
                            {subtitle}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-9 border-t border-[#eadbd4]">
                  <details className="border-b border-[#eadbd4] py-5">
                    <summary className="cursor-pointer font-bold text-[#59291f] flex justify-between">
                      Shipping & Returns
                      <span>+</span>
                    </summary>

                    <p className="text-sm text-[#6d554d] leading-7 mt-3">
                      Shipping time depends on delivery
                      location and product availability.
                      Returns are available on eligible
                      products.
                    </p>
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
          className="py-12 md:py-16 bg-[#fffaf7] border-t border-[#eadbd4]"
        >
          <Container>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
              <div>
                <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996]">
                  Real Customer Experience
                </p>

                <h2 className="heading-font text-4xl md:text-5xl text-[#5B3B32] mt-2">
                  Ratings & Reviews
                </h2>
              </div>

              <button
                type="button"
                onClick={handleOpenReviewModal}
                className="bg-[#9A3F4D] text-white px-6 py-3 rounded-xl font-semibold"
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
                <div className="grid lg:grid-cols-2 gap-5">
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
          <section className="py-12 md:py-16 bg-[#f7f2ee] border-t border-[#eadbd4]">
            <Container>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996]">
                    You May Also Like
                  </p>

                  <h2 className="heading-font text-4xl md:text-5xl text-[#5B3B32] mt-1">
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

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-7">
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

      {/* Mobile Sticky Button */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-[#fffaf7] border-t border-[#eadbd4] px-4 py-3 flex items-center justify-between gap-4 shadow-lg">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#8b746b]">
            Total
          </p>

          <p className="font-bold text-lg text-[#9A213A]">
            ₹
            {Number(product.price).toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={Number(product.stock) <= 0}
          className="flex-1 max-w-[220px] bg-[#9A213A] text-white px-6 py-3 rounded-full text-xs tracking-[0.15em] uppercase font-bold disabled:opacity-50"
        >
          Add To Cart
        </button>
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && lightboxImage && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-5">
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center"
          >
            <FiX size={25} />
          </button>

          <img
            src={lightboxImage}
            alt={product.name}
            className="max-w-full max-h-[90vh] object-contain"
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