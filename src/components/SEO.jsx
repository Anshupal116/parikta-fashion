import { Helmet } from "react-helmet-async";

function SEO({
  title = "Parikta Fashion | Premium Women's Ethnic Wear",
  description = "Shop premium women's ethnic wear, suits, kurtis, sarees, dresses and designer fashion online at Parikta Fashion.",
  keywords = "women ethnic wear, suits, kurtis, sarees, dresses, designer wear, indian fashion, parikta fashion",
  canonical = "https://www.parikta.com",
  image = "https://www.parikta.com/og-image.jpg",
  type = "website",
  author = "Parikta Fashion",
  noIndex = false,
  structuredData = null,
}) {
  return (
    <Helmet prioritizeSeoTags>
      {/* Basic SEO */}
      <title>{title}</title>

      <meta name="description" content={description} />

      <meta name="keywords" content={keywords} />

      <meta name="author" content={author} />

      <meta
        name="robots"
        content={noIndex ? "noindex,nofollow" : "index,follow"}
      />

      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />

      <meta property="og:site_name" content="Parikta Fashion" />

      <meta property="og:title" content={title} />

      <meta
        property="og:description"
        content={description}
      />

      <meta property="og:url" content={canonical} />

      <meta property="og:image" content={image} />

      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta name="twitter:title" content={title} />

      <meta
        name="twitter:description"
        content={description}
      />

      <meta name="twitter:image" content={image} />

      {/* Theme */}
      <meta name="theme-color" content="#9A3F4D" />

      {/* Mobile */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
      />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
{/* Organization Schema */}
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",

  name: "Parikta Fashion",

  url: "https://www.parikta.com",

  logo: "https://www.parikta.com/logo.png",

  description:
    "Parikta Fashion is a premium women's ethnic wear brand offering designer sarees, suits, kurtis, lehengas and customized fashion.",

  email: "support@parikta.com",

  telephone: "+91-9999999999",

  address: {
    "@type": "PostalAddress",
    addressLocality: "Delhi",
    addressRegion: "Delhi",
    postalCode: "110001",
    addressCountry: "IN",
  },

  sameAs: [
    "https://www.instagram.com/pariktafashion",
    "https://www.facebook.com/pariktafashion",
  ],
})}
</script>

{/* Website Schema */}
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",

  "@type": "WebSite",

  name: "Parikta Fashion",

  url: "https://www.parikta.com",

  potentialAction: {
    "@type": "SearchAction",

    target:
      "https://www.parikta.com/products?search={search_term_string}",

    "query-input": "required name=search_term_string",
  },
})}
</script>

    </Helmet>
  );
}

export default SEO;