import { useParams } from "react-router-dom";
import { useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { products } from "../data/products";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const product = products.find((item) => item.id === Number(id));
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  const handleAddToBag = () => {
    addToCart(product);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#f7f2ee]">
          <h1 className="heading-font text-4xl text-[#5B3B32]">
            Product Not Found
          </h1>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen py-14 px-6">
        <div className="max-w-6xl mx-auto bg-[#fffaf7] rounded-[32px] shadow-lg border border-[#eadbd4] p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="w-full h-[580px] bg-[#FDEAE6] rounded-[28px] overflow-hidden border border-[#eadbd4]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="pt-2">
              <span className="inline-block bg-[#FDEAE6] text-[#9A3F4D] px-4 py-2 rounded-full text-sm font-semibold">
                {product.type}
              </span>

              <h1 className="heading-font text-5xl text-[#5B3B32] mt-5 leading-tight">
                {product.name}
              </h1>

              <p className="text-[#6d554d] mt-4 text-lg leading-8">
                {product.description}
              </p>

              <div className="flex items-center gap-3 mt-6">
                <span className="bg-[#9A3F4D] text-white px-3 py-1 rounded-md font-semibold">
                  4.8 ★
                </span>
                <span className="text-[#8b746b]">124 Ratings</span>
              </div>

              <div className="mt-7 border-t border-b border-[#eadbd4] py-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-4xl font-bold text-[#9A3F4D]">
                    ₹{product.price}
                  </span>

                  <span className="text-xl text-gray-400 line-through">
                    ₹{product.mrp}
                  </span>

                  <span className="text-green-600 text-lg font-bold">
                    {product.discount}
                  </span>
                </div>

                <p className="text-green-600 text-sm mt-2">
                  Inclusive of all taxes
                </p>
              </div>

              <div className="mt-7">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-[#5B3B32]">
                    Select Size
                  </h3>
                  <button className="text-[#9A3F4D] font-semibold">
                    Size Chart
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  {["S", "M", "L", "XL", "XXL"].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 rounded-xl border-2 font-bold transition ${
                        selectedSize === size
                          ? "bg-[#9A3F4D] text-white border-[#9A3F4D]"
                          : "border-[#eadbd4] text-[#5B3B32] hover:border-[#9A3F4D]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={handleAddToBag}
                  className="bg-[#9A3F4D] text-white py-4 rounded-xl font-bold hover:bg-[#7d3140]"
                >
                  ADD TO BAG
                </button>

                <button className="bg-[#5B3B32] text-white py-4 rounded-xl font-bold hover:bg-[#3f2d28]">
                  BUY NOW
                </button>
              </div>

              {added && (
                <p className="mt-4 text-green-600 font-semibold">
                  Product added to bag successfully ✅
                </p>
              )}

              {product.type === "Customize" && (
                <button className="mt-4 w-full border-2 border-[#9A3F4D] text-[#9A3F4D] py-4 rounded-xl font-bold hover:bg-[#9A3F4D] hover:text-white">
                  CUSTOMIZE THIS DESIGN
                </button>
              )}

              <div className="mt-8 border-t border-[#eadbd4] pt-6">
                <h3 className="font-bold text-lg text-[#5B3B32]">
                  Delivery Options
                </h3>

                <div className="flex mt-4 max-w-md">
                  <input
                    type="text"
                    placeholder="Enter pincode"
                    className="border border-[#eadbd4] px-4 py-3 w-full rounded-l-xl outline-none focus:border-[#9A3F4D]"
                  />

                  <button className="border border-l-0 border-[#eadbd4] px-6 rounded-r-xl text-[#9A3F4D] font-bold">
                    CHECK
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5 text-sm">
                  <div className="bg-[#FDEAE6] rounded-xl p-3 text-center">
                    Free Delivery
                  </div>
                  <div className="bg-[#FDEAE6] rounded-xl p-3 text-center">
                    Easy Return
                  </div>
                  <div className="bg-[#FDEAE6] rounded-xl p-3 text-center">
                    COD Available
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-[#eadbd4] pt-6">
                <h3 className="font-bold text-lg text-[#5B3B32]">
                  Product Details
                </h3>

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-[#9b8378]">Fabric</p>
                    <p className="font-semibold text-[#5B3B32]">
                      Premium Georgette
                    </p>
                  </div>

                  <div>
                    <p className="text-[#9b8378]">Work</p>
                    <p className="font-semibold text-[#5B3B32]">
                      Embroidery
                    </p>
                  </div>

                  <div>
                    <p className="text-[#9b8378]">Occasion</p>
                    <p className="font-semibold text-[#5B3B32]">
                      Wedding / Party
                    </p>
                  </div>

                  <div>
                    <p className="text-[#9b8378]">Care</p>
                    <p className="font-semibold text-[#5B3B32]">
                      Dry Clean Only
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetails;