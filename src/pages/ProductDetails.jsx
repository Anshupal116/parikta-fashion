import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import Container from "../components/Container";
import { useCart } from "../context/CartContext";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";
import { getProductById, getProducts } from "../services/productService";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addRecentlyViewed } = useRecentlyViewed();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);

        const response = await getProductById(id);

        if (response.success) {
          const productData = response.product;

          setProduct(productData);
          setMainImage(productData.image);
          addRecentlyViewed({
            ...productData,
            id: productData._id,
          });

          const allProducts = await getProducts();

          const similar = allProducts
            .filter((item) => item._id !== productData._id)
            .slice(0, 4);

          setSimilarProducts(similar);
        }
      } catch (error) {
        console.log(error);
        alert("Product load failed");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToBag = () => {
    addToCart({
      ...product,
      id: product._id,
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f7f2ee] flex items-center justify-center">
          <h1 className="heading-font text-4xl text-[#5B3B32]">
            Loading Product...
          </h1>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f7f2ee] flex items-center justify-center">
          <h1 className="heading-font text-4xl text-[#5B3B32]">
            Product Not Found
          </h1>
        </main>
        <Footer />
      </>
    );
  }

  const galleryImages = [
    product.image,
    product.hoverImage,
    ...(product.images || []),
  ].filter(Boolean);

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen pb-20 md:pb-0">
        <section className="py-6 md:py-12">
          <Container>
            <div className="text-xs text-[#8b746b] mb-5">
              <Link to="/" className="hover:text-[#9A3F4D]">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link to="/products" className="hover:text-[#9A3F4D]">
                Collection
              </Link>
              <span className="mx-2">/</span>
              <span className="text-[#5B3B32]">{product.name}</span>
            </div>

            <div className="grid lg:grid-cols-[56%_44%] gap-8 lg:gap-12">
              <div>
                <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl overflow-hidden">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-[430px] md:h-[620px] object-cover object-top hover:scale-105 duration-700"
                  />
                </div>

                <div className="grid grid-cols-4 gap-3 mt-3">
                  {galleryImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setMainImage(img)}
                      className={`h-24 md:h-32 rounded-2xl overflow-hidden border ${
                        mainImage === img
                          ? "border-[#9A3F4D]"
                          : "border-[#eadbd4]"
                      }`}
                    >
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#fffaf7] border border-[#eadbd4] rounded-3xl p-6 md:p-8 h-fit lg:sticky lg:top-32">
                <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996] font-semibold">
                  {product.type}
                </p>

                <h1 className="heading-font text-4xl md:text-6xl text-[#5B3B32] mt-3 leading-tight">
                  {product.name}
                </h1>

                <p className="text-[#6d554d] text-sm md:text-base leading-7 mt-4">
                  {product.description}
                </p>

                <div className="flex items-center gap-3 mt-5">
                  <span className="bg-[#9A3F4D] text-white px-3 py-1 rounded-full text-sm font-semibold">
                    4.8 ★
                  </span>
                  <span className="text-[#8b746b] text-sm">
                    124 ratings & reviews
                  </span>
                </div>

                <div className="border-y border-[#eadbd4] py-6 mt-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-3xl md:text-4xl font-bold text-[#9A3F4D]">
                      ₹{product.price}
                    </span>

                    {product.mrp && (
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.mrp}
                      </span>
                    )}

                    {product.discount && (
                      <span className="text-green-600 font-bold">
                        {product.discount}
                      </span>
                    )}
                  </div>

                  <p className="text-green-600 text-sm mt-2">
                    Inclusive of all taxes
                  </p>

                  <p className="text-sm mt-3 text-[#5B3B32]">
                    Stock:{" "}
                    <span className="font-bold">
                      {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                    </span>
                  </p>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm tracking-[0.2em] uppercase font-bold text-[#5B3B32]">
                      Select Size
                    </h3>

                    <button className="text-[#9A3F4D] text-sm font-semibold">
                      Size Guide
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-3 mt-4">
                    {["S", "M", "L", "XL", "XXL"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 rounded-xl border font-bold transition ${
                          selectedSize === size
                            ? "bg-[#9A3F4D] text-white border-[#9A3F4D]"
                            : "bg-white border-[#eadbd4] text-[#5B3B32]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-7">
                  <button
                    onClick={handleAddToBag}
                    disabled={product.stock <= 0}
                    className="bg-[#9A3F4D] text-white py-4 rounded-xl font-bold text-sm tracking-[0.12em] uppercase hover:bg-[#7d3140] disabled:opacity-50"
                  >
                    Add To Bag
                  </button>

                  <Link to="/checkout">
                    <button className="w-full bg-[#5B3B32] text-white py-4 rounded-xl font-bold text-sm tracking-[0.12em] uppercase hover:bg-[#3f2d28]">
                      Buy Now
                    </button>
                  </Link>
                </div>

                {added && (
                  <p className="mt-4 text-green-600 font-semibold text-sm">
                    Product added to bag successfully ✅
                  </p>
                )}

                {product.type === "Customize" && (
                  <Link to="/customize">
                    <button className="mt-4 w-full border border-[#9A3F4D] text-[#9A3F4D] py-4 rounded-xl font-bold text-sm tracking-[0.12em] uppercase hover:bg-[#FDEAE6]">
                      Customize This Design
                    </button>
                  </Link>
                )}

                <div className="grid grid-cols-3 gap-3 mt-7">
                  {["Free Delivery", "Easy Return", "COD Available"].map(
                    (item) => (
                      <div
                        key={item}
                        className="bg-[#FDEAE6] rounded-xl p-3 text-center text-[11px] text-[#5B3B32] font-semibold"
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>

                <div className="mt-7 border-t border-[#eadbd4] pt-6 space-y-5">
                  <details>
                    <summary className="cursor-pointer flex justify-between font-bold text-[#5B3B32]">
                      Product Details <span>+</span>
                    </summary>
                    <p className="text-[#6d554d] text-sm leading-7 mt-3">
                      Premium designer outfit crafted with attention to detail,
                      ideal for festive, wedding and party occasions.
                    </p>
                  </details>

                  <details>
                    <summary className="cursor-pointer flex justify-between font-bold text-[#5B3B32]">
                      Fabric & Care <span>+</span>
                    </summary>
                    <p className="text-[#6d554d] text-sm leading-7 mt-3">
                      Fabric: Premium Georgette. Work: Designer embroidery.
                      Care: Dry clean only.
                    </p>
                  </details>

                  <details>
                    <summary className="cursor-pointer flex justify-between font-bold text-[#5B3B32]">
                      Shipping & Returns <span>+</span>
                    </summary>
                    <p className="text-[#6d554d] text-sm leading-7 mt-3">
                      Free shipping on prepaid orders. Easy returns available on
                      eligible products.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-10 md:py-14">
          <Container>
            <div className="flex items-center justify-between mb-7">
              <div>
                <p className="text-xs tracking-[0.28em] uppercase text-[#BFA996]">
                  You May Also Like
                </p>
                <h2 className="heading-font text-4xl text-[#5B3B32]">
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
                <ProductCard key={item._id} item={item} />
              ))}
            </div>
          </Container>
        </section>
      </main>

      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-[#fffaf7] border-t border-[#eadbd4] px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#8b746b]">Total</p>
          <p className="font-bold text-[#9A3F4D]">₹{product.price}</p>
        </div>

        <button
          onClick={handleAddToBag}
          disabled={product.stock <= 0}
          className="bg-[#9A3F4D] text-white px-8 py-3 rounded-full text-xs tracking-[0.18em] uppercase font-bold disabled:opacity-50"
        >
          Add To Bag
        </button>
      </div>

      <Footer />
    </>
  );
}

export default ProductDetails;