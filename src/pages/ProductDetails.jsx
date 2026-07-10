import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiCheck,
  FiChevronRight,
  FiHeart,
  FiMaximize2,
  FiShoppingBag,
  FiX,
  FiZoomIn,
} from "react-icons/fi";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import Container from "../components/Container";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";

import {
  getProductById,
  getProducts,
} from "../services/productService";

const PRODUCT_SIZES = ["S", "M", "L", "XL", "XXL"];

const careInstructions = [
  {
    title: "Dry Clean",
    subtitle: "Only",
    symbol: "◫",
  },
  {
    title: "Do Not",
    subtitle: "Bleach",
    symbol: "△",
  },
  {
    title: "Iron at Low",
    subtitle: "Temperature",
    symbol: "▱",
  },
  {
    title: "Store in Dry",
    subtitle: "Place",
    symbol: "⌂",
  },
];

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addRecentlyViewed } = useRecentlyViewed();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setImageError(false);
        setSelectedSize("");

        const response = await getProductById(id);

        if (!response.success) {
          setProduct(null);
          return;
        }

        const productData = response.product;

        setProduct(productData);
        setMainImage(productData.image);

        addRecentlyViewed({
          ...productData,
          id: productData._id,
        });

        const allProducts = await getProducts();

        const similar = (allProducts || [])
          .filter((item) => item._id !== productData._id)
          .filter(
            (item) =>
              item.category === productData.category ||
              item.type === productData.type
          )
          .slice(0, 4);

        setSimilarProducts(similar);
      } catch (error) {
        console.error("Product load error:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, addRecentlyViewed]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const images = [
      product.image,
      product.hoverImage,

      product.galleryImages?.front,
      product.galleryImages?.back,
      product.galleryImages?.side,
      product.galleryImages?.closeUp,
      product.galleryImages?.modelPose,

      ...(product.images || []),
    ].filter(Boolean);

    return [...new Set(images)];
  }, [product]);

  const productId = product?._id || product?.id;

  const liked = productId
    ? isInWishlist(productId)
    : false;

  const handleAddToBag = () => {
    if (!product || product.stock <= 0) return;

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
    }, 2200);
  };

  const handleBuyNow = () => {
    if (!product || product.stock <= 0) return;

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

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const showPreviousImage = () => {
    setLightboxIndex((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1
    );
  };

  const showNextImage = () => {
    setLightboxIndex((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-[#fffaf7] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#eadbd4] border-t-[#9A3F4D] rounded-full animate-spin mx-auto" />

            <h1 className="heading-font text-4xl text-[#5B3B32] mt-5">
              Loading Product
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
              Back to Collection
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const features = [
    {
      title: "Premium",
      subtitle: "Quality",
    },
    {
      title: "Lightweight",
      subtitle: "Fabric",
    },
    {
      title: "Elegant",
      subtitle: product.category || "Design",
    },
    {
      title: "Perfect for",
      subtitle: "Occasions",
    },
  ];

  const productDetails = [
    ["Fabric", product.fabric || "Premium Fabric"],
    ["Color", product.color || "As shown in image"],
    ["Work", product.work || "Designer Embroidery"],
    ["Category", product.category || "Designer Wear"],
    ["Type", product.type || "Ready-made"],
    [
      "Occasion",
      product.occasion || "Wedding, Party, Festive & Reception",
    ],
  ];

  return (
    <>
      <Navbar />

      <main className="bg-[#fffaf7] min-h-screen pb-24 md:pb-0">
        <section className="py-5 md:py-9">
          <Container>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#5B3B32] mb-6 overflow-x-auto whitespace-nowrap">
              <Link to="/" className="hover:text-[#9A3F4D]">
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
              {/* LEFT IMAGE SECTION */}
              <div>
                <div className="relative bg-[#f2ece8] overflow-hidden group">
                  {imageError ? (
                    <div className="w-full h-[480px] md:h-[760px] flex items-center justify-center bg-[#f7f2ee]">
                      <p className="text-[#8b746b]">
                        Image unavailable
                      </p>
                    </div>
                  ) : (
                    <img
                      src={mainImage}
                      alt={product.name}
                      onError={() => setImageError(true)}
                      className="w-full h-[520px] md:h-[760px] object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex =
                        galleryImages.indexOf(mainImage);

                      openLightbox(
                        currentIndex >= 0 ? currentIndex : 0
                      );
                    }}
                    className="absolute top-4 right-4 md:top-5 md:right-5 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-[#5B3B32] hover:bg-[#9A3F4D] hover:text-white transition"
                    aria-label="Open image"
                  >
                    <FiZoomIn size={22} />
                  </button>

                  {product.badge && (
                    <span className="absolute top-4 left-4 bg-[#efd8d4] text-[#4f2923] px-4 py-2 text-[10px] md:text-xs tracking-[0.12em] uppercase font-bold">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <div
                    className={`grid gap-2 md:gap-3 mt-3 ${
                      galleryImages.length >= 5
                        ? "grid-cols-4 md:grid-cols-5"
                        : "grid-cols-4"
                    }`}
                  >
                    {galleryImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => {
                          setMainImage(image);
                          setImageError(false);
                        }}
                        onDoubleClick={() => openLightbox(index)}
                        className={`relative overflow-hidden bg-[#f2ece8] h-28 md:h-44 border-2 transition ${
                          mainImage === image
                            ? "border-[#9A3F4D]"
                            : "border-transparent hover:border-[#cfa69f]"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover object-top"
                        />

                        {mainImage === image && (
                          <span className="absolute inset-0 border-2 border-white/50" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT PRODUCT INFO */}
              <div className="lg:sticky lg:top-28">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      toggleWishlist({
                        ...product,
                        id: productId,
                      })
                    }
                    className={`absolute right-0 top-0 w-11 h-11 rounded-full border flex items-center justify-center transition ${
                      liked
                        ? "bg-[#9A3F4D] text-white border-[#9A3F4D]"
                        : "bg-white text-[#5B3B32] border-[#eadbd4]"
                    }`}
                    aria-label="Wishlist"
                  >
                    <FiHeart
                      size={21}
                      fill={liked ? "currentColor" : "none"}
                    />
                  </button>

                  {product.badge && (
                    <span className="inline-block bg-[#efd8d4] text-[#4f2923] px-4 py-2 text-[10px] tracking-[0.14em] uppercase font-bold">
                      {product.badge}
                    </span>
                  )}

                  <h1 className="heading-font text-5xl md:text-6xl lg:text-7xl text-[#59291f] leading-[0.92] mt-4 pr-14">
                    {product.name}
                  </h1>

                  <p className="text-lg md:text-xl text-[#2f2927] mt-4">
                    {product.color
                      ? `${product.color} ${product.category || ""}`
                      : product.category || product.type}
                  </p>

                  <div className="flex flex-wrap items-end gap-3 mt-5">
                    <span className="text-3xl md:text-4xl font-semibold text-[#9A213A]">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>

                    {product.mrp &&
                      Number(product.mrp) >
                        Number(product.price) && (
                        <span className="text-lg text-gray-400 line-through pb-1">
                          ₹
                          {Number(product.mrp).toLocaleString(
                            "en-IN"
                          )}
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
                </div>

                {/* Decorative Divider */}
                <div className="flex items-center gap-3 my-7">
                  <span className="h-px bg-[#d8b079] flex-1" />
                  <span className="text-[#c9934c] text-lg">
                    ◇◇
                  </span>
                  <span className="h-px bg-[#d8b079] flex-1" />
                </div>

                <p className="text-[#292321] leading-7 text-base">
                  {product.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-4 gap-3 mt-7">
                  {features.map((feature) => (
                    <div
                      key={`${feature.title}-${feature.subtitle}`}
                      className="text-center"
                    >
                      <div className="w-11 h-11 mx-auto rounded-full border border-[#b87968] text-[#7f372b] flex items-center justify-center">
                        <FiCheck size={20} />
                      </div>

                      <p className="text-[11px] md:text-xs text-[#59291f] mt-2 leading-4">
                        {feature.title}
                        <br />
                        {feature.subtitle}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Size */}
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
                    {PRODUCT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`w-14 h-14 md:w-16 md:h-14 border rounded-md font-medium transition ${
                          selectedSize === size
                            ? "bg-[#9A213A] text-white border-[#9A213A]"
                            : "bg-white text-[#292321] border-[#d8cbc4] hover:border-[#9A213A]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {!selectedSize && (
                    <p className="text-xs text-[#8b746b] mt-3">
                      Select a size before adding this product.
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="space-y-3 mt-7">
                  <button
                    type="button"
                    onClick={handleAddToBag}
                    disabled={product.stock <= 0}
                    className="w-full bg-gradient-to-r from-[#9A213A] to-[#ad2e47] text-white py-4 rounded-md font-bold tracking-[0.1em] uppercase flex items-center justify-center gap-3 hover:opacity-95 disabled:opacity-50"
                  >
                    <FiShoppingBag size={20} />
                    {product.stock > 0
                      ? "Add To Cart"
                      : "Out Of Stock"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
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
                      product.stock > 0
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Out of stock"}
                  </span>
                </p>

                {product.type === "Customize" && (
                  <Link to="/customize">
                    <button className="mt-4 w-full bg-[#5B3B32] text-white py-4 rounded-md font-bold tracking-[0.1em] uppercase">
                      Customize This Design
                    </button>
                  </Link>
                )}

                {/* Product Details */}
                <div className="mt-9">
                  <div className="flex items-center gap-4 mb-5">
                    <h2 className="text-base tracking-[0.12em] uppercase font-bold text-[#292321] whitespace-nowrap">
                      Product Details
                    </h2>

                    <span className="h-px bg-[#d8b079] flex-1" />
                  </div>

                  <ul className="space-y-2 text-sm md:text-base text-[#302a27]">
                    {productDetails.map(([label, value]) => (
                      <li
                        key={label}
                        className="flex items-start gap-2"
                      >
                        <span className="mt-2 w-1 h-1 bg-[#59291f] rounded-full shrink-0" />

                        <span>
                          <strong>{label}:</strong> {value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Care */}
                <div className="mt-9">
                  <div className="flex items-center gap-4 mb-5">
                    <h2 className="text-base tracking-[0.12em] uppercase font-bold text-[#292321] whitespace-nowrap">
                      Care Instructions
                    </h2>

                    <span className="h-px bg-[#d8b079] flex-1" />
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {careInstructions.map((instruction) => (
                      <div
                        key={instruction.title}
                        className="text-center"
                      >
                        <div className="text-3xl text-[#7f372b]">
                          {instruction.symbol}
                        </div>

                        <p className="text-[10px] md:text-xs text-[#302a27] leading-4 mt-2">
                          {instruction.title}
                          <br />
                          {instruction.subtitle}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accordions */}
                <div className="mt-9 border-t border-[#eadbd4]">
                  <details className="border-b border-[#eadbd4] py-5">
                    <summary className="cursor-pointer font-bold text-[#59291f] flex justify-between">
                      Shipping & Returns
                      <span>+</span>
                    </summary>

                    <p className="text-sm text-[#6d554d] leading-7 mt-3">
                      Shipping timelines depend on product availability
                      and delivery location. Returns are available on
                      eligible products as per store policy.
                    </p>
                  </details>

                  <details className="border-b border-[#eadbd4] py-5">
                    <summary className="cursor-pointer font-bold text-[#59291f] flex justify-between">
                      Product Disclaimer
                      <span>+</span>
                    </summary>

                    <p className="text-sm text-[#6d554d] leading-7 mt-3">
                      Actual product colour may vary slightly because of
                      lighting, photography and screen settings.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Similar Products */}
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

      {/* Mobile Sticky Cart */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-[#fffaf7] border-t border-[#eadbd4] px-4 py-3 flex items-center justify-between gap-4 shadow-lg">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#8b746b]">
            Total
          </p>

          <p className="font-bold text-lg text-[#9A213A]">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddToBag}
          disabled={product.stock <= 0}
          className="flex-1 max-w-[220px] bg-[#9A213A] text-white px-6 py-3 rounded-full text-xs tracking-[0.15em] uppercase font-bold disabled:opacity-50"
        >
          Add To Cart
        </button>
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 md:p-8">
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center z-10"
          >
            <FiX size={25} />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPreviousImage}
                className="absolute left-3 md:left-8 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-2xl z-10"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-3 md:right-8 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-2xl z-10"
              >
                ›
              </button>
            </>
          )}

          <div className="max-w-5xl w-full h-full flex flex-col items-center justify-center">
            <img
              src={galleryImages[lightboxIndex]}
              alt={`${product.name} enlarged`}
              className="max-w-full max-h-[82vh] object-contain"
            />

            <div className="flex items-center gap-2 text-white mt-4">
              <FiMaximize2 />
              <span className="text-sm">
                {lightboxIndex + 1} / {galleryImages.length}
              </span>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default ProductDetails;