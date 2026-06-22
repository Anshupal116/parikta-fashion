import { Link, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";

function OrderSuccess() {
  const { orderId } = useParams();

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f2ee] min-h-screen py-14 flex items-center">
        <Container>
          <div className="max-w-2xl mx-auto bg-[#fffaf7] border border-[#eadbd4] rounded-[32px] shadow-lg p-10 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#FDEAE6] flex items-center justify-center text-5xl">
              ✓
            </div>

            <p className="text-[#BFA996] font-semibold tracking-[0.25em] mt-8">
              PARIKTA FASHION
            </p>

            <h1 className="heading-font text-5xl text-[#5B3B32] mt-3">
              Order Placed Successfully
            </h1>

            <p className="text-[#8b746b] mt-4 leading-7">
              Thank you for shopping with Parikta Fashion. Your order has been
              received and will be processed soon.
            </p>

            <div className="bg-[#FDEAE6] border border-[#eadbd4] rounded-2xl p-5 mt-8">
              <p className="text-[#8b746b]">Order ID</p>

              <h2 className="text-2xl font-bold text-[#9A3F4D] mt-2">
                {orderId}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-8">
              <Link to="/">
                <button className="w-full bg-[#9A3F4D] text-white py-4 rounded-xl font-bold hover:bg-[#7d3140]">
                  Continue Shopping
                </button>
              </Link>

              <a
                href="https://wa.me/919711111111"
                target="_blank"
                rel="noreferrer"
              >
                <button className="w-full border-2 border-green-600 text-green-600 py-4 rounded-xl font-bold hover:bg-green-50">
                  WhatsApp Support
                </button>
              </a>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}

export default OrderSuccess;