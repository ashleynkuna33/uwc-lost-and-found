
import { useEffect, useState } from "react";
import {
  FiX,
  FiMapPin,
  FiCalendar,
  FiTag,
  FiShield,
  FiFileText,
  FiImage,
  FiCheckCircle,
  FiAlertCircle,
  FiSend,
  FiSearch,
} from "react-icons/fi";
import ImageCarousel from "./ImageCarousel";

function CreateClaim({ item, items = [], hidden, onClaim, readOnly = false }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedItem, setSelectedItem] = useState(item || null);
  const [itemSearch, setItemSearch] = useState("");

  const [form, setForm] = useState({
    proofOfOwnership: "",
  });

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") hidden?.();
    };

    document.addEventListener("keydown", handleEscape);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [hidden]);

  const activeItem = item || selectedItem;
  const claimableItems = items.filter(
    (candidate) =>
      String(candidate.type || "").toUpperCase() === "FOUND" &&
      !["claimed", "returned"].includes(
        String(candidate.status || "").toLowerCase()
      )
  );
  const query = itemSearch.trim().toLowerCase();
  const filteredItems = claimableItems.filter((candidate) =>
    [
      candidate.itemName,
      candidate.name,
      candidate.description,
      candidate.category,
      candidate.location,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  );

  const itemName =
    activeItem?.name ||
    activeItem?.title ||
    activeItem?.itemName ||
    activeItem?.item_name ||
    "Found Item";

  const itemImages =
    activeItem?.images?.length > 0
      ? activeItem.images
      : [activeItem?.imageUrl || activeItem?.image].filter(Boolean);

  const itemLocation =
    activeItem?.location?.name ||
    activeItem?.location ||
    activeItem?.foundLocation ||
    "Location not specified";

  const foundDate =
    activeItem?.dateFound ||
    activeItem?.dateOccurred ||
    activeItem?.found_at ||
    activeItem?.createdAt ||
    activeItem?.created_at;

  const formatDate = (date) => {
    if (!date) return "Not specified";
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
      ? String(date)
      : parsed.toLocaleDateString("en-ZA", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (message) setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!onClaim) {
      setMessage({
        type: "error",
        text: "Claim submission has not been connected yet.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await onClaim({
        itemId: activeItem.id ?? activeItem.item_id,
        ...form,
      });

      setMessage({
        type: "success",
        text: "Your claim was submitted successfully.",
      });

      setForm({
        proofOfOwnership: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Unable to submit claim.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 px-3 py-4 backdrop-blur-[3px] sm:px-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) hidden?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-title"
        className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-8">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <FiShield className="text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Lost & Found
              </span>
            </div>
            <h2
              id="claim-title"
              className="text-xl font-bold text-slate-900 sm:text-2xl"
            >
              {readOnly
                ? "Item Details"
                : activeItem
                  ? "Claim This Item"
                  : "Choose an Item to Claim"}
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              {readOnly
                ? "Database metadata for this item."
                : activeItem
                  ? "Review the item and verify your ownership."
                  : "Search found items and select the one that belongs to you."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => hidden?.()}
            aria-label="Close popup"
            className="rounded-full bg-slate-100 p-2.5 text-slate-600 transition hover:bg-slate-200"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {readOnly && activeItem ? (
            <div className="p-5 sm:p-8">
              <h3 className="mb-4 text-lg font-bold text-slate-900">
                Item metadata
              </h3>
              <dl className="grid gap-3 sm:grid-cols-2">
                {Object.entries(activeItem).map(([key, value]) => (
                  <div
                    key={key}
                    className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <dt className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {key}
                    </dt>
                    <dd className="max-h-60 overflow-auto whitespace-pre-wrap break-words font-mono text-sm text-slate-800">
                      {value === null
                        ? "null"
                        : value === undefined
                          ? "undefined"
                          : typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : activeItem ? (
            <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Item Information */}
            <div className="border-b border-slate-100 bg-slate-50/70 p-5 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">
                  Item Information
                </h3>
                <div className="flex items-center gap-2">
                  {!item && (
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                      Choose another
                    </button>
                  )}
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {activeItem.status || "Found"}
                  </span>
                </div>
              </div>

              <ImageCarousel
                images={itemImages}
                alt={itemName}
                className="w-full"
                imageClassName="aspect-[16/10] w-full rounded-2xl border border-slate-200 bg-slate-100"
                fallback={
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <FiImage size={42} />
                    <span className="text-sm">No image available</span>
                  </div>
                }
              />

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                {itemName}
              </h3>

              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
                    <FiTag size={17} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Category</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {activeItem.category?.name ||
                        activeItem.category ||
                        "Other"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
                    <FiMapPin size={17} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">
                      Location Found
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {itemLocation}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
                    <FiCalendar size={17} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">
                      Date Reported
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDate(foundDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <FiFileText className="text-blue-600" />
                  Description
                </h4>
                <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                  {activeItem.description ||
                    "No additional description has been provided for this item."}
                </p>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <FiShield
                  className="mt-0.5 shrink-0 text-blue-600"
                  size={18}
                />
                <p className="text-xs leading-5 text-blue-800">
                  For security reasons, you may be asked to provide
                  additional information to verify ownership before
                  this item is released.
                </p>
              </div>
            </div>

            {/* Claim Form */}
            <div className="p-5 sm:p-8">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Ownership Verification
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Complete the form below to request ownership of
                  this item.
                </p>
              </div>

              <form
                id="claim-form"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FiShield className="text-slate-400" />
                    Ownership Explanation
                    <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    name="proofOfOwnership"
                    value={form.proofOfOwnership}
                    onChange={handleChange}
                    rows={5}
                    required
                    minLength={20}
                    placeholder="Describe details that only the real owner would know, such as unique marks, contents, or the circumstances in which you lost it..."
                    className={`${inputClass} resize-none`}
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Provide specific details that can help the finder
                    verify your ownership. Avoid sharing passwords
                    or other sensitive credentials.
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
                  <FiAlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />
                  <p className="text-xs leading-5 text-amber-800">
                    Submitting a claim does not guarantee ownership.
                    Your information will be reviewed before the item
                    is handed over.
                  </p>
                </div>

                {message && (
                  <div
                    role="status"
                    className={`flex items-start gap-2 rounded-xl p-3 text-sm ${
                      message.type === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {message.type === "success" ? (
                      <FiCheckCircle className="mt-0.5 shrink-0" />
                    ) : (
                      <FiAlertCircle className="mt-0.5 shrink-0" />
                    )}
                    {message.text}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => hidden?.()}
                    className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-1"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-[1.5]"
                  >
                    {loading ? (
                      "Submitting..."
                    ) : (
                      <>
                        <FiSend size={16} />
                        Submit Claim
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          ) : (
            <div className="p-5 sm:p-8">
              <label
                htmlFor="claim-item-search"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Search found items
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10">
                <FiSearch className="shrink-0 text-slate-400" />
                <input
                  id="claim-item-search"
                  type="search"
                  value={itemSearch}
                  onChange={(event) => setItemSearch(event.target.value)}
                  placeholder="Search by item, category, location, or description"
                  className="w-full text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              <div className="mt-4 max-h-[55vh] space-y-3 overflow-y-auto">
                {filteredItems.map((candidate) => (
                  <div
                    key={candidate.id ?? candidate.item_id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedItem(candidate);
                      setItemSearch("");
                    }}
                    className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        setSelectedItem(candidate);
                        setItemSearch("");
                      }
                    }}
                  >
                    <ImageCarousel
                      images={
                        candidate.images?.length
                          ? candidate.images
                          : [candidate.image].filter(Boolean)
                      }
                      alt={candidate.itemName || candidate.name || "Found item"}
                      className="w-16"
                      imageClassName="h-16 w-16 rounded-lg"
                      fallback={
                        <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                          <FiImage size={24} />
                        </span>
                      }
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-slate-900">
                        {candidate.itemName || candidate.name || "Found Item"}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {[candidate.category, candidate.location]
                          .filter(Boolean)
                          .join(" · ") || "Details not specified"}
                      </span>
                      {candidate.description && (
                        <span className="mt-1 block line-clamp-2 text-xs text-slate-500">
                          {candidate.description}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    {claimableItems.length === 0
                      ? "There are no found items available to claim."
                      : "No found items match your search."}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!readOnly && (
          <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-3 text-center">
            <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <FiShield size={13} />
              Your information should only be used for claim verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateClaim;
