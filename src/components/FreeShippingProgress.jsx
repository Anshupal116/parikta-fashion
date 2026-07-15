function FreeShippingProgress({
  cartTotal = 0,
  freeShippingLimit = 1999,
}) {
  const remainingAmount = Math.max(
    freeShippingLimit - cartTotal,
    0
  );

  const progressPercentage = Math.min(
    (cartTotal / freeShippingLimit) * 100,
    100
  );

  const unlocked =
    cartTotal >= freeShippingLimit;

  return (
    <div className="bg-[#FDEAE6] border border-[#eadbd4] rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#5B3B32]">
          {unlocked
            ? "🎉 Free shipping unlocked"
            : `₹${remainingAmount.toLocaleString(
                "en-IN"
              )} away from free shipping`}
        </p>

        <span className="text-xs font-bold text-[#9A3F4D]">
          {Math.round(progressPercentage)}%
        </span>
      </div>

      <div className="h-2 bg-white rounded-full overflow-hidden mt-3">
        <div
          className="h-full bg-[#9A3F4D] rounded-full transition-all duration-500"
          style={{
            width: `${progressPercentage}%`,
          }}
        />
      </div>
    </div>
  );
}

export default FreeShippingProgress;