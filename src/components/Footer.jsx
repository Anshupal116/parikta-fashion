import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiPhone,
  FiTwitter,
  FiYoutube,
} from "react-icons/fi";
import {
  FaPinterestP,
  FaWhatsapp,
} from "react-icons/fa";

import { useSettings } from "../context/SettingsContext";

function Footer() {
  const {
    store,
    contact,
    address,
    social,
    website,
    formattedAddress,
    whatsappUrl,
  } = useSettings();

  const socialLinks = [
    {
      label: "Instagram",
      href: social?.instagram,
      icon: FiInstagram,
    },
    {
      label: "Facebook",
      href: social?.facebook,
      icon: FiFacebook,
    },
    {
      label: "Pinterest",
      href: social?.pinterest,
      icon: FaPinterestP,
    },
    {
      label: "YouTube",
      href: social?.youtube,
      icon: FiYoutube,
    },
    {
      label: "Twitter",
      href: social?.twitter,
      icon: FiTwitter,
    },
    {
      label: "WhatsApp",
      href: whatsappUrl,
      icon: FaWhatsapp,
    },
    {
      label: "Email",
      href: contact?.supportEmail
        ? `mailto:${contact.supportEmail}`
        : "",
      icon: FiMail,
    },
  ].filter((item) => Boolean(item.href));

  const footerAddress =
    formattedAddress ||
    address?.country ||
    "";

  return (
    <footer className="bg-[#2f241f] pb-20 text-white lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="inline-flex max-w-full flex-col"
            >
              {store?.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store?.storeName || "Store logo"}
                  className="max-h-16 w-auto max-w-[220px] object-contain object-left"
                />
              ) : (
                <>
                  <h2 className="logo-font break-words text-5xl leading-none text-[#E8D7CC] sm:text-6xl">
                    {store?.storeName || "Parikta Fashion"}
                  </h2>

                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.34em] text-[#BFA996]">
                    {store?.tagline || "Timeless Indian Elegance"}
                  </p>
                </>
              )}
            </Link>

            {store?.logoUrl && store?.tagline && (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#BFA996]">
                {store.tagline}
              </p>
            )}

            <p className="mt-5 text-sm leading-7 text-[#cdbbb1]">
              Premium women designer wear and custom outfits crafted with
              timeless elegance, comfort and luxury finish.
            </p>

            {socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {socialLinks.map(
                  ({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target={
                        href.startsWith("mailto:")
                          ? undefined
                          : "_blank"
                      }
                      rel={
                        href.startsWith("mailto:")
                          ? undefined
                          : "noreferrer"
                      }
                      aria-label={label}
                      title={label}
                      className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-[#9A3F4D] active:scale-95"
                    >
                      <Icon size={18} />
                    </a>
                  )
                )}
              </div>
            )}
          </div>

          {[
            [
              "Shop",
              [
                ["/products", "New Arrivals"],
                ["/products", "Suits"],
                ["/products", "Sarees"],
                ["/products", "Lehengas"],
                ["/products", "Kurti Sets"],
              ],
            ],
            [
              "Brand",
              [
                ["/about", "About Us"],
                ["/lookbook", "Lookbook"],
                ["/customize", "Custom Design"],
                ["/wishlist", "Wishlist"],
                ["/contact", "Contact"],
              ],
            ],
            [
              "Customer Care",
              [
                ["/faq", "FAQ"],
                ["/contact", "Shipping Info"],
                ["/contact", "Return Policy"],
                ["/contact", "Size Guide"],
                ["/contact", "Support"],
              ],
            ],
          ].map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#E8D7CC]">
                {title}
              </h3>

              <ul className="space-y-3 text-sm text-[#cdbbb1]">
                {links.map(([to, label]) => (
                  <li key={label}>
                    <Link
                      className="transition hover:text-white"
                      to={to}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="min-w-0">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#E8D7CC]">
              Contact
            </h3>

            <div className="space-y-4 text-sm text-[#cdbbb1]">
              {contact?.displayPhone && (
                <a
                  href={`tel:${String(
                    contact.displayPhone
                  ).replace(/[^\d+]/g, "")}`}
                  className="flex min-w-0 gap-3 transition hover:text-white"
                >
                  <FiPhone className="mt-1 shrink-0" />
                  <span className="break-words">
                    {contact.displayPhone}
                  </span>
                </a>
              )}

              {contact?.supportEmail && (
                <a
                  href={`mailto:${contact.supportEmail}`}
                  className="flex min-w-0 gap-3 transition hover:text-white"
                >
                  <FiMail className="mt-1 shrink-0" />
                  <span className="break-all">
                    {contact.supportEmail}
                  </span>
                </a>
              )}

              {footerAddress && (
                <a
                  href={address?.googleMapsUrl || undefined}
                  target={
                    address?.googleMapsUrl
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    address?.googleMapsUrl
                      ? "noreferrer"
                      : undefined
                  }
                  className={`flex min-w-0 gap-3 ${
                    address?.googleMapsUrl
                      ? "transition hover:text-white"
                      : ""
                  }`}
                >
                  <FiMapPin className="mt-1 shrink-0" />
                  <span className="break-words leading-6">
                    {footerAddress}
                  </span>
                </a>
              )}

              {contact?.supportHours && (
                <p className="border-t border-white/10 pt-4 text-xs leading-6 text-[#BFA996]">
                  {contact.supportHours}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs text-[#BFA996] md:flex-row md:px-6">
          <p>
            {website?.footerCopyright ||
              `© ${new Date().getFullYear()} ${
                store?.storeName || "Parikta Fashion"
              }. All rights reserved.`}
          </p>

          <div className="flex flex-wrap justify-center gap-5">
            <Link
              className="transition hover:text-white"
              to="/faq"
            >
              FAQ
            </Link>

            <Link
              className="transition hover:text-white"
              to="/contact"
            >
              Privacy Policy
            </Link>

            <Link
              className="transition hover:text-white"
              to="/contact"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;