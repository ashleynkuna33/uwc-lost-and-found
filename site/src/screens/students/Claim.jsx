import { useState } from "react";
import { FiUser } from "react-icons/fi";
import { CiLogout } from "react-icons/ci";

// Dummy data
const items = [
  {
    id: 1,
    itemName: "Sumsang S26 Ultra",
    location: "Student Center",
    collection: "CPS Office",
  },
];

const steps = [
  {
    title: "We review your claim",
    text: "Staff compare your details with the item within 3–5 business days.",
  },
  {
    title: "You get an email",
    text: "We'll tell you if it's approved or if we need more information.",
  },
  {
    title: "Collect your item",
    text: "Show photo ID at the front desk within 14 days.",
  },
];

const inputClass =
  "box-border w-full min-w-0 rounded-lg border border-gray-300 bg-white p-2 focus:border-[#152862] focus:outline-none focus:ring-2 focus:ring-[#152862]/30";

function Claim() {
  const [agreed, setAgreed] = useState(false);
  const [receiveMethod, setReceiveMethod] = useState("pickup");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) return;
    // TODO: send the claim to your backend here
    console.log("Claim submitted", { receiveMethod });
  };

  return (
    <div className="min-h-screen w-full bg-[#eaf1f7] p-4 md:p-6">
      <div className="flex w-full flex-col">
        {/* User section */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          <div className="flex min-w-0 items-center gap-2 rounded-full bg-[#152862]/10 px-3 py-2 font-semibold text-[#152862]">
            <FiUser className="shrink-0 text-[#cead5e]" size={22} />
            <span className="truncate">
              Logged in as: <strong className="text-black">4429119</strong>
            </span>
          </div>

          <button
            type="button"
            aria-label="Log out"
            className="rounded-full p-1 hover:bg-red-50"
          >
            <CiLogout size={26} color="#f14c53" />
          </button>
        </div>

        {/* Body section */}
        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
          {/* Main card */}
          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-lg md:p-6 lg:col-span-3">
            <h1 className="text-xl font-bold text-[#152862] md:text-2xl">
              Claim your item
            </h1>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Date + location */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-2">
                  <label htmlFor="lost-date">When did you lose it?</label>
                  <input
                    id="lost-date"
                    name="lostDate"
                    type="date"
                    className={inputClass}
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                  <label htmlFor="lost-location">Where did you lose it?</label>
                  <input
                    id="lost-location"
                    name="lostLocation"
                    type="search"
                    placeholder="Location e.g. Library"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="lost-attachment">Attachments:</label>
                <input
                  id="lost-attachment"
                  name="lostAttachment"
                  type="file"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="lost-description">Description:</label>
                <p className="text-sm text-gray-500 [overflow-wrap:anywhere]">
                  Please provide a detailed description of the lost item,
                  including any distinguishing features or identifying marks.
                  This will help us in locating and returning your item to you.
                </p>
                <textarea
                  id="lost-description"
                  name="lostDescription"
                  placeholder="Provide a detailed description of the lost item."
                  className={`${inputClass} h-40 resize-y md:h-60`}
                />
              </div>

              {/* Receive method */}
              <fieldset className="min-w-0">
                <legend className="mb-2 [overflow-wrap:anywhere]">
                  How do you want to receive your item?
                </legend>

                <div className="space-y-2">
                  <label
                    htmlFor="receive-pickup"
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 ${
                      receiveMethod === "pickup"
                        ? "border-[#152862] bg-[#152862]/5"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      id="receive-pickup"
                      name="receiveMethod"
                      type="radio"
                      value="pickup"
                      checked={receiveMethod === "pickup"}
                      onChange={(e) => setReceiveMethod(e.target.value)}
                      className="mt-1 shrink-0 text-[#152862] focus:ring-[#152862]"
                    />
                    <span className="[overflow-wrap:anywhere]">
                      Pick up at the office
                    </span>
                  </label>

                  <label
                    htmlFor="receive-courier"
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 ${
                      receiveMethod === "courier"
                        ? "border-[#152862] bg-[#152862]/5"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      id="receive-courier"
                      name="receiveMethod"
                      type="radio"
                      value="courier"
                      checked={receiveMethod === "courier"}
                      onChange={(e) => setReceiveMethod(e.target.value)}
                      className="mt-1 shrink-0 text-[#152862] focus:ring-[#152862]"
                    />
                    <span className="[overflow-wrap:anywhere]">
                      Arrange a courier to pick up the item
                    </span>
                  </label>
                </div>
              </fieldset>

              {/* Contact number */}
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="contact-number">Contact Number:</label>
                <input
                  id="contact-number"
                  name="contactNumber"
                  type="tel"
                  placeholder="Enter your cellphone number"
                  className={inputClass}
                />
              </div>

              {/* Terms */}
              <label htmlFor="terms" className="flex items-start gap-2">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 shrink-0 rounded border-gray-300 text-[#152862] focus:ring-[#152862] focus:ring-offset-0"
                />
                <span className="text-sm text-gray-700 [overflow-wrap:anywhere]">
                  I confirm that this item belongs to me and I agree to the
                  terms and conditions.
                </span>
              </label>

              {/* Submit button (centered) */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={!agreed}
                  className="w-full rounded-lg bg-[#152862] px-8 py-2 font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#152862] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>

          {/* Side cards */}
          <div className="min-w-0 space-y-4 lg:col-span-2">
            {/* Item card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-md md:p-6">
              <h2 className="font-semibold">Item</h2>
              {items.map((item) => (
                <div key={item.id} className="mt-2">
                  <h3 className="mb-2 font-medium text-[#152862] [overflow-wrap:anywhere]">
                    {item.itemName}
                  </h3>
                  <p className="text-sm text-gray-700">
                    Location: {item.location}
                  </p>
                  <p className="text-sm text-gray-700">
                    Collection: {item.collection}
                  </p>
                </div>
              ))}
            </div>

            {/* Status card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-md md:p-6">
              <h2 className="mb-5 text-lg font-bold text-black">Status</h2>

              <ol>
                {steps.map((step, i) => (
                  <li
                    key={step.title}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {/* connector line (skipped on the last step) */}
                    {i < steps.length - 1 && (
                      <span className="absolute bottom-1 left-4 top-10 w-0.5 -translate-x-1/2 bg-black/20" />
                    )}

                    {/* number circle */}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#152862] text-sm font-medium text-white ring-1 ring-[#152862]/20">
                      {i + 1}
                    </span>

                    {/* text */}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-black">{step.title}</h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-gray-500">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Need help card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-md md:p-6">
              <h2 className="mb-3 text-lg font-bold text-black">Need help?</h2>

              <p className="text-black">
                Lost &amp; Found office, library ground floor.
              </p>

              <p className="mt-2 text-black [overflow-wrap:anywhere]">
                <a
                  href="mailto:lostfound@campus.edu"
                  className="text-emerald-600 underline underline-offset-2 hover:text-emerald-500"
                >
                  lostfound@campus.edu
                </a>
                {" · "}
                <a href="tel:+27215550142" className="hover:underline">
                  021 555 0142
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Claim;