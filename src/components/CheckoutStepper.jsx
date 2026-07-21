import { FiCheck } from "react-icons/fi";

const steps = [
  { key: "bag", label: "Bag" },
  { key: "address", label: "Address" },
  { key: "payment", label: "Payment" },
];

function CheckoutStepper({ activeStep = "bag" }) {
  const activeIndex = steps.findIndex((step) => step.key === activeStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const completed = index < activeIndex;
          const active = index === activeIndex;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex min-w-0 flex-col items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition ${
                    completed
                      ? "border-[#9A3F4D] bg-[#9A3F4D] text-white"
                      : active
                      ? "border-[#9A3F4D] bg-[#FDEAE6] text-[#9A3F4D]"
                      : "border-[#d9cbc4] bg-white text-[#9b8b84]"
                  }`}
                >
                  {completed ? <FiCheck size={16} /> : index + 1}
                </div>

                <span
                  className={`truncate text-xs font-semibold sm:text-sm ${
                    active || completed
                      ? "text-[#5B3B32]"
                      : "text-[#9b8b84]"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-[2px] flex-1 ${
                    index < activeIndex
                      ? "bg-[#9A3F4D]"
                      : "bg-[#e8ddd7]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CheckoutStepper;
