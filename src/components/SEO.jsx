import { Helmet } from "react-helmet-async";

function SEO({
  title = "Parikta Fashion | Premium Women's Ethnic Wear",
  description = "Shop premium women's ethnic wear, suits, kurtis, sarees, dresses and designer fashion online at Parikta Fashion.",
  keywords = "women ethnic wear, suits, kurtis, sarees, dresses, designer wear, indian fashion, parikta fashion",
  canonical = "https://parikta.com",
  image = "https://parikta.com/og-image.jpg",
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
    </Helmet>
  );
}

export default SEO;