import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCheck,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";

import { useCart } from "../context/CartContext";

const sizes = ["S", "M", "L", "XL", "XXL"];

function QuickViewModal({
  product,
  open,
  onClose,
}) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] =
    useState("");

  const [mainImage, setMainImage] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!open || !product) return;

    setSelectedSize("");
    setMainImage(product.image || "");
    setAdded(false);

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open, product]);

  if (!open || !product) return null;

  const averageRating = Number(
    product.averageRating || 0
  );

  const reviewCount = Number(
    product.reviewCount || 0
  );

  const productImages = [
    product.image,
    product.hoverImage,
    product.galleryImages?.front,
    product.galleryImages?.back,
    product.galleryImages?.side,
  ].filter(Boolean);

  const uniqueImages = [...new Set(productImages)];

  const prepareProduct = () => {
    if (Number(product.stock) <= 0) {
      alert("Product out of stock hai");
      return null;
    }

    if (!selectedSize) {
      alert("Please select a size");
      return null;
    }

    return {
      ...product,
      id: product._id || product.id,
      selectedSize,
    };
  };

  const handleAddToCart = () => {
    const cartProduct = prepareProduct();

    if (!cartProduct) return;

    addToCart(cartProduct);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  const handleBuyNow = () => {
    const cartProduct = prepareProduct();

    if (!cartProduct) return;

    addToCart(cartProduct);
    onClose();
    navigate("/checkout");
  };

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
      onClick={onClose}
    >
      <div
        className="relative bg-[#fffaf7] w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center text-[#5B3B32]"
        >
          <FiX size={22} />
        </button>

        <div className="grid lg:grid-cols-2">
          <div className="bg-[#f2ece8] p-4 md:p-7">
            <img
              src={mainImage || product.image}
              alt={product.name}
              className="w-full h-[430px] md:h-[650px] object-cover object-top rounded-2xl"
            />

            {uniqueImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {uniqueImages
                  .slice(0, 5)
                  .map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setMainImage(image)
                      }
                      className={`h-20 md:h-24 overflow-hidden rounded-xl border-2 ${
                        mainImage === image
                          ? "border-[#9A3F4D]"
                          : "border-transparent"
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
                  ))}
              </div>
            )}
          </div>

          <div className="p-6 md:p-10">
            {product.badge && (
              <span className="inline-block bg-[#FDEAE6] text-[#9A3F4D] px-3 py-2 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase">
                {product.badge}
              </span>
            )}

            <p className="text-xs tracking-[0.24em] uppercase text-[#BFA996] mt-5">
              {product.type}
            </p>

            <h2 className="heading-font text-4xl md:text-6xl text-[#5B3B32] leading-none mt-2">
              {product.name}
            </h2>

            {reviewCount > 0 ? (
              <div className="flex items-center gap-2 mt-4">
                <div className="flex text-[#C9A227]">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <span
                        key={star}
                        className={
                          star <=
                          Math.round(
                            averageRating
                          )
                            ? "text-[#C9A227]"
                            : "text-[#ded4ce]"
                        }
                      >
                        ★
                      </span>
                    )
                  )}
                </div>

                <span className="text-sm font-bold text-[#5B3B32]">
                  {averageRating.toFixed(1)}
                </span>

                <span className="text-sm text-[#8b746b]">
                  ({reviewCount} reviews)
                </span>
              </div>
            ) : (
              <p className="text-sm text-[#8b746b] mt-4">
                No reviews yet
              </p>
            )}

            <div className="flex items-end gap-3 mt-6">
              <span className="text-3xl font-bold text-[#9A213A]">
                ₹
                {Number(
                  product.price || 0
                ).toLocaleString("en-IN")}
              </span>

              {Number(product.mrp) >
                Number(product.price) && (
                <span className="text-gray-400 line-through pb-1">
                  ₹
                  {Number(
                    product.mrp
                  ).toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <p className="text-sm text-[#8b746b] mt-2">
              Inclusive of all taxes
            </p>

            <p className="text-[#6d554d] leading-7 mt-6 line-clamp-4">
              {product.description}
            </p>

            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                "Premium Quality",
                "Designer Finish",
                "Secure Checkout",
              ].map((feature) => (
                <div
                  key={feature}
                  className="bg-[#FDEAE6] rounded-xl p-3 text-center"
                >
                  <FiCheck className="mx-auto text-[#9A3F4D]" />

                  <p className="text-[10px] text-[#5B3B32] mt-2">
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#5B3B32]">
                  Select Size
                </h3>

                <span
                  className={`text-sm font-semibold ${
                    Number(product.stock) > 0
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {Number(product.stock) > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setSelectedSize(size)
                    }
                    className={`w-13 h-13 px-4 py-3 border rounded-xl font-semibold transition ${
                      selectedSize === size
                        ? "bg-[#9A3F4D] border-[#9A3F4D] text-white"
                        : "bg-white border-[#eadbd4] text-[#5B3B32]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {added && (
              <div className="mt-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-semibold text-sm">
                Product added to cart.
              </div>
            )}

            <div className="space-y-3 mt-7">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={
                  Number(product.stock) <= 0
                }
                className="w-full bg-[#9A3F4D] hover:bg-[#7c303d] text-white py-4 rounded-xl font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <FiShoppingBag size={20} />
                Add To Cart
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={
                  Number(product.stock) <= 0
                }
                className="w-full border border-[#9A3F4D] text-[#9A3F4D] py-4 rounded-xl font-bold uppercase tracking-[0.12em] disabled:opacity-50"
              >
                Buy Now
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(
                    `/product/${
                      product._id || product.id
                    }`
                  );
                }}
                className="w-full text-[#5B3B32] py-3 text-sm underline underline-offset-4"
              >
                View Full Product Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;