import { createContext, useContext, useEffect, useState } from "react";

const RecentlyViewedContext = createContext();

export function RecentlyViewedProvider({ children }) {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("parikta_recently_viewed");

    if (saved) {
      setRecentlyViewed(JSON.parse(saved));
    }
  }, []);

  const addRecentlyViewed = (product) => {
    if (!product) return;

    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== product.id);
      const updated = [product, ...filtered].slice(0, 4);

      localStorage.setItem(
        "parikta_recently_viewed",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  return (
    <RecentlyViewedContext.Provider
      value={{ recentlyViewed, addRecentlyViewed }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext);
}