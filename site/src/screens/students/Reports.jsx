import { useEffect, useState } from "react";
import { FiUser, FiImage, FiX } from "react-icons/fi";
import { CiLogout } from "react-icons/ci";

const steps = [
  {
    title: "Report submitted",
    text: "Your lost or found item details are recorded for review.",
  },
  {
    title: "We review your report",
    text: "Other students and Lost & Found staff can use your details to identify the item.",
  },
  {
    title: "Get notified",
    text: "You'll be contacted when there is an update or a possible match.",
  },
];

const inputClass =
  "box-border w-full min-w-0 rounded-lg border border-gray-300 bg-white p-2 focus:border-[#152862] focus:outline-none focus:ring-2 focus:ring-[#152862]/30";

function Reports() {
  const [reportType, setReportType] = useState("Lost");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  // Create an image preview when a file is selected.
  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [image]);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setImage(null);
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setSubmitMessage("Please select a valid image file.");
      e.target.value = "";
      setImage(null);
      return;
    }

    setSubmitMessage("");
    setImage(selectedFile);
  };

  const removeImage = () => {
    setImage(null);

    // Allow the same image to be selected again.
    const fileInput = document.getElementById("report-image");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    formData.set("reportType", reportType);

    if (image) {
      formData.set("image", image);
    }

    // TODO: Send formData to your Spring Boot backend.
    console.log("Report submitted:", Object.fromEntries(formData.entries()));

    setSubmitMessage(
      "Your report is ready. Connect the backend to submit it successfully."
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#eaf1f7] p-4 md:p-6">
      <div className="flex w-full flex-col">
        {/* User section */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#152862] md:text-2xl">
              Report an Item
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Help reunite lost items with their owners.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex min-w-0 items-center gap-2 rounded-full bg-[#152862]/10 px-3 py-2 font-semibold text-[#152862]">
              <FiUser className="shrink-0 text-[#cead5e]" size={22} />
              <span className="truncate text-sm">
                Logged in as:{" "}
                <strong className="text-black">4429119</strong>
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
        </div>

        {/* Main body */}
        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
          {/* Report form */}
          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-lg md:p-6 lg:col-span-3">
            <h2 className="text-xl font-bold text-[#152862] md:text-2xl">
              Submit a Report
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Provide accurate details so others can help identify the item.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Report type */}
              <fieldset>
                <legend className="mb-2 font-medium">
                  What would you like to report?
                </legend>

                <div className="grid grid-cols-2 gap-3">
                  {["Lost", "Found"].map((type) => (
                    <label
                      key={type}
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 font-medium transition ${
                        reportType === type
                          ? "border-[#152862] bg-[#152862]/5 text-[#152862]"
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportType"
                        value={type}
                        checked={reportType === type}
                        onChange={() => setReportType(type)}
                        className="accent-[#152862]"
                      />
                      {type} item
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Item name */}
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="item-name">Item name:</label>
                <input
                  id="item-name"
                  name="itemName"
                  type="text"
                  placeholder="e.g. Samsung phone, student card or keys"
                  className={inputClass}
                  required
                />
              </div>

              {/* Date and location */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-2">
                  <label htmlFor="item-date">
                    {reportType === "Lost"
                      ? "When did you lose it?"
                      : "When did you find it?"}
                  </label>
                  <input
                    id="item-date"
                    name="itemDate"
                    type="date"
                    max={new Date().toLocaleDateString("en-CA")}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                  <label htmlFor="item-location">
                    {reportType === "Lost"
                      ? "Where did you lose it?"
                      : "Where did you find it?"}
                  </label>
                  <input
                    id="item-location"
                    name="location"
                    type="text"
                    placeholder="e.g. UWC Library"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Image upload */}
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="report-image">Item photo:</label>

                <p className="text-sm text-gray-500">
                  Upload a photo to help others recognise the item. Images are
                  optional.
                </p>

                <input
                  id="report-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={inputClass}
                />

                {/* Image preview */}
                {imagePreview && (
                  <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-[#152862]">
                        <FiImage size={18} />
                        <span className="truncate">{image.name}</span>
                      </div>

                      <button
                        type="button"
                        onClick={removeImage}
                        aria-label="Remove uploaded image"
                        className="shrink-0 rounded-full p-2 text-red-500 hover:bg-red-50"
                      >
                        <FiX size={18} />
                      </button>
                    </div>

                    <img
                      src={imagePreview}
                      alt="Preview of the reported item"
                      className="max-h-72 w-full rounded-lg object-contain"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                      Image preview
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="item-description">Item description:</label>

                <p className="text-sm text-gray-500">
                  Describe the item's colour, brand, size, identifying marks,
                  or anything else that could help someone recognise it.
                </p>

                <textarea
                  id="item-description"
                  name="description"
                  placeholder="Provide details about the item..."
                  className={`${inputClass} h-40 resize-y md:h-48`}
                  required
                />
              </div>

              {/* Contact details */}
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="contact-number">Contact number:</label>
                <input
                  id="contact-number"
                  name="contactNumber"
                  type="tel"
                  placeholder="Enter your cellphone number"
                  className={inputClass}
                  required
                />
              </div>

              {/* Feedback message */}
              {submitMessage && (
                <p
                  role="status"
                  className="break-words rounded-lg bg-[#152862]/5 p-3 text-sm text-[#152862]"
                >
                  {submitMessage}
                </p>
              )}

              {/* Submit button */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#152862] px-8 py-2 font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#152862] focus:ring-offset-2 sm:w-auto"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>

          {/* Right-side cards */}
          <div className="min-w-0 space-y-4 lg:col-span-2">
            {/* Reporting guide */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-md md:p-6">
              <h2 className="text-lg font-bold text-black">
                Reporting Guide
              </h2>

              <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-600">
                <p>
                  <strong className="text-[#152862]">Lost an item?</strong>
                  <br />
                  Report where and when you last saw it. Include details that
                  could help identify your belongings.
                </p>

                <p>
                  <strong className="text-[#152862]">Found an item?</strong>
                  <br />
                  Report where and when you found it. Avoid sharing sensitive
                  identifying details publicly.
                </p>

                <p>
                  <strong className="text-[#152862]">Add a photo</strong>
                  <br />
                  A clear image can make it easier for others to recognise the
                  item.
                </p>
              </div>
            </div>

            {/* What happens next */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-md md:p-6">
              <h2 className="mb-5 text-lg font-bold text-black">
                What Happens Next?
              </h2>

              <ol>
                {steps.map((step, index) => (
                  <li
                    key={step.title}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {index < steps.length - 1 && (
                      <span className="absolute bottom-1 left-4 top-10 w-0.5 -translate-x-1/2 bg-black/20" />
                    )}

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#152862] text-sm font-medium text-white ring-1 ring-[#152862]/20">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-black">
                        {step.title}
                      </h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-gray-500">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Help card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-md md:p-6">
              <h2 className="mb-3 text-lg font-bold text-black">
                Need Help?
              </h2>

              <p className="text-sm leading-relaxed text-gray-600">
                If you need help reporting an item or believe you have found
                something that belongs to another student, contact your
                campus Lost &amp; Found office.
              </p>

              <p className="mt-3 text-sm text-gray-500">
                Contact details can be added here once your campus office
                information is confirmed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;