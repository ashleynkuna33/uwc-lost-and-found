import { useEffect, useMemo, useState } from "react";
import { FaHandHoldingHeart } from "react-icons/fa";
import { FiPlusCircle, FiSearch, FiX, FiHeadphones, FiMapPin, FiClock, FiChevronRight, FiPackage, FiRefreshCw, FiAlertCircle, FiInbox } from "react-icons/fi";

import { itemApi } from "../../api/modules/items.api";
import ImageCarousel from "../../components/ImageCarousel";

import homeP1 from "../../assets/homeP1.png";
import homeP2 from "../../assets/homeP2.jpg";
import homeP3 from "../../assets/homeP3.jpg";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RECENT_ITEMS = 4;

function getCreatedTimestamp(item) {
  if (!item.createdAt) return null;

  // Supports ISO timestamps and MySQL-style datetime strings.
  const value = String(item.createdAt).replace(" ", "T");
  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : null;
}

function getTimeAgo(timestamp, now) {
  if (timestamp === null) return "Unknown";

  const minutes = Math.floor((now - timestamp) / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

function RecentItemCard({ item, now, onClick }) {
  const isLost = item.type === "LOST";
  const timestamp = getCreatedTimestamp(item);

  const ItemIcon =
    /earbud|headphone/i.test(item.itemName || "")
      ? FiHeadphones
      : FiPackage;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View ${item.itemName || "item"} details`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="
        group flex w-full shrink-0 items-center gap-3
        rounded-xl border border-gray-200
        bg-white px-3 py-3 text-left shadow-sm
        transition-all duration-200
        hover:border-[#cead5e]
        hover:bg-[#f8fafc]
        hover:shadow-md
        cursor-pointer
      "
    >
      {/* ITEM IMAGE / ICON */}
      <ImageCarousel
        images={item.images}
        alt={item.itemName || "Item image"}
        className="w-14"
        imageClassName="h-14 w-14 rounded-xl bg-[#152862]/10 text-[#152862]"
        fallback={<ItemIcon size={23} />}
      />

      {/* ITEM INFORMATION */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3
            className="
              min-w-0 truncate text-sm
              font-bold text-[#152862]
            "
          >
            {item.itemName || "Unnamed item"}
          </h3>

          <span
            className={`
              shrink-0 rounded-full px-2 py-0.5
              text-[9px] font-bold
              ${
                isLost
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }
            `}
          >
            {isLost ? "LOST" : "FOUND"}
          </span>
        </div>

        <p className="truncate text-xs text-gray-500">
          {item.description || "No description provided."}
        </p>

        <div
          className="
            mt-1 flex flex-wrap items-center
            gap-x-4 gap-y-1
            text-[11px] text-gray-500
          "
        >
          <span className="flex items-center gap-1">
            <FiMapPin
              size={12}
              className="shrink-0 text-[#cead5e]"
            />
            <span className="truncate">
              {item.location || "Unknown location"}
            </span>
          </span>

          <span className="flex items-center gap-1">
            <FiClock
              size={12}
              className="shrink-0 text-[#cead5e]"
            />
            {getTimeAgo(timestamp, now)}
          </span>
        </div>
      </div>

      <FiChevronRight
        size={18}
        className="
          shrink-0 text-gray-400
          transition-all duration-200
          group-hover:translate-x-1
          group-hover:text-[#cead5e]
        "
      />
    </div>
  );
}

function Home({ setView }) {
  const [activeImage, setActiveImage] = useState(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const [now, setNow] = useState(() => Date.now());


  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      setLoading(true);
      setError(null);

      try {
        const response = await itemApi.getAll();

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid items response.");
        }

        if (!cancelled) {
          setItems(response.data);
          setNow(Date.now());
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch recent items:", err);

          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load recent items."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);


  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const recentItems = useMemo(() => {
    return items
      .filter((item) => {
        const timestamp = getCreatedTimestamp(item);

        if (timestamp === null) return false;

        const age = now - timestamp;

        return age >= 0 && age <= DAY_MS;
      })
      .sort(
        (a, b) =>
          getCreatedTimestamp(b) - getCreatedTimestamp(a)
      )
      .slice(0, MAX_RECENT_ITEMS);
  }, [items, now]);

  const hasCreationTimestamps = items.some(
    (item) => getCreatedTimestamp(item) !== null
  );

  const openFindItems = () => {
    setView?.("Find Items");
  };

  const refreshItems = () => {
    setRefreshKey((value) => value + 1);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[#eaf1f7]">

      {/* HEADER */}
      <div className="shrink-0 flex justify-center p-6 bg-[#152862] border-b-4 border-[#cead5e] shadow-md">
        <h1 className="font-bold text-white text-2xl tracking-wide">
          UWC LOST ITEMS SYSTEM
        </h1>
      </div>

      {/* NAVIGATION */}
      <div className="shrink-0 mx-4 mt-4 p-4 bg-white border border-gray-300 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[#152862]">
          <FaHandHoldingHeart
            size={24}
            className="text-[#cead5e]"
          />
          <h2 className="text-xl font-bold">Navigate:</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setView?.("My Reports")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#cead5e] text-[#152862] font-bold text-xs rounded-xl shadow transition-all duration-150 hover:bg-[#b89a50] hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <FiPlusCircle size={18} />
            REPORT LOST ITEM
          </button>

          <button
            type="button"
            onClick={openFindItems}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#152862] text-white font-bold text-xs rounded-xl shadow transition-all duration-150 hover:bg-[#0e1b42] hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <FiSearch
              size={18}
              className="text-[#cead5e]"
            />
            FIND LOST ITEM
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-1 md:grid-cols-2 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)] p-4 gap-4">

        {/* ========================================== */}
        {/* LEFT COLUMN: RECENTLY REPORTED ITEMS       */}
        {/* ========================================== */}

        <div className="bg-white border border-gray-300 rounded-xl p-4 h-full min-h-0 overflow-hidden shadow-sm flex flex-col gap-3">

          {/* SECTION HEADER */}
          <div className="shrink-0 flex items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div className="min-w-0">
              <h3 className="font-bold text-base text-[#152862]">
                Recently Reported Items
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Items logged in the past 24 hours across campus.
              </p>
            </div>

            <button
              type="button"
              onClick={refreshItems}
              disabled={loading}
              aria-label="Refresh recent items"
              title="Refresh items"
              className="
                rounded-lg border border-gray-200
                p-2 text-[#152862]
                transition hover:bg-gray-100
                disabled:opacity-40
                cursor-pointer
              "
            >
              <FiRefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>

          {/* COUNT */}
          {!loading && !error && (
            <div className="shrink-0 flex items-center justify-between">
              <span className="text-[11px] font-medium text-gray-500">
                {recentItems.length} recent{" "}
                {recentItems.length === 1 ? "item" : "items"}
              </span>

              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <FiClock size={12} />
                Last 24 hours
              </span>
            </div>
          )}

          {/* RECENT ITEMS FEED */}
          <div className="h-0 flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-2 pr-1">

            {loading ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-[#152862]">
                <FiRefreshCw
                  size={26}
                  className="animate-spin"
                />
                <p className="text-xs text-gray-500">
                  Loading recent items...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
                <FiAlertCircle
                  size={32}
                  className="text-red-400"
                />

                <p className="text-sm font-semibold text-gray-700">
                  Unable to load recent items
                </p>

                <p className="text-xs text-gray-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={refreshItems}
                  className="text-xs font-semibold text-[#152862] hover:underline cursor-pointer"
                >
                  Try again
                </button>
              </div>
            ) : items.length > 0 && !hasCreationTimestamps ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
                <FiAlertCircle
                  size={30}
                  className="text-amber-500"
                />

                <p className="text-sm font-semibold text-gray-700">
                  Report timestamps unavailable
                </p>

                <p className="max-w-xs text-xs text-gray-500">
                  The items API needs to include createdAt
                  to display reports from the last 24 hours.
                </p>
              </div>
            ) : recentItems.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
                <FiInbox
                  size={38}
                  className="text-gray-300"
                />

                <p className="text-sm font-semibold text-gray-600">
                  No recent reports
                </p>

                <p className="text-xs text-gray-400">
                  No items have been reported in the past 24 hours.
                </p>
              </div>
            ) : (
              recentItems.map((item) => (
                <RecentItemCard
                  key={item.id}
                  item={item}
                  now={now}
                  onClick={openFindItems}
                />
              ))
            )}

          </div>

          {/* VIEW ALL ITEMS */}
          <button
            type="button"
            onClick={openFindItems}
            className="
              shrink-0 mt-auto flex items-center justify-center gap-2
              rounded-lg border border-[#152862]/15
              bg-[#f3f6fc] px-4 py-2.5
              text-xs font-bold text-[#152862]
              transition-all hover:bg-[#e6ebf6]
              cursor-pointer
            "
          >
            View All Items
            <FiChevronRight size={16} />
          </button>

        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: CAMPUS DROP-OFF LOCATIONS   */}
        {/* ========================================== */}

        <div className="bg-white border border-gray-300 rounded-xl p-4 h-full min-h-0 overflow-y-auto overscroll-contain shadow-sm flex flex-col gap-3">

          <h3 className="font-bold text-base text-[#152862] border-b pb-2">
            Campus Drop-Off Locations
          </h3>

          <p className="text-xs text-gray-500 flex items-start gap-2">
            <FiMapPin className="text-[#cead5e] shrink-0" />
            Main Library Security Desk — 08:00 - 21:00 |
            08:00 - 13:00 during holidays
          </p>

          <p className="text-xs text-gray-500 flex items-center gap-2">
            <FiMapPin className="text-[#cead5e]" />
            CPS Main Gate — 24/7
          </p>

          <p className="text-xs text-gray-500 flex items-center gap-2">
            <FiMapPin className="text-[#cead5e]" />
            ResLife — 24/7
          </p>

          {/* LOCATION IMAGES */}
          <div className="grid grid-cols-1 gap-3 mt-1">

            <button
              type="button"
              onClick={() =>
                setActiveImage({
                  src: homeP1,
                  title: "Main Library Security Desk",
                  time: "08:00 - 21:00 | 08:00 - 13:00 during holidays",
                })
              }
              className="overflow-hidden rounded-xl border border-gray-200 cursor-pointer group"
            >
              <img
                src={homeP1}
                alt="Library help desk"
                className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveImage({
                  src: homeP2,
                  title: "CPS Main Gate Security Building",
                  time: "24/7",
                })
              }
              className="overflow-hidden rounded-xl border border-gray-200 cursor-pointer group"
            >
              <img
                src={homeP2}
                alt="UWC security protection building"
                className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveImage({
                  src: homeP3,
                  title: "ResLife Building",
                  time: "24/7",
                })
              }
              className="overflow-hidden rounded-xl border border-gray-200 cursor-pointer group"
            >
              <img
                src={homeP3}
                alt="ResLife Building"
                className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </button>

          </div>

        </div>
      </div>

      {/* ========================================== */}
      {/* LOCATION IMAGE MODAL                       */}
      {/* ========================================== */}

      {activeImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setActiveImage(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={activeImage.title}
            className="relative bg-white p-2 rounded-2xl max-w-3xl w-full flex flex-col items-center gap-2 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close image"
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 bg-gray-900/70 text-white p-2 rounded-full hover:bg-gray-900 cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <img
              src={activeImage.src}
              alt={activeImage.title}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />

            <span className="text-sm font-bold text-[#152862] pb-2">
              {activeImage.title}
            </span>

            <span className="text-sm font-bold text-[#152862]">
              {activeImage.time}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;
