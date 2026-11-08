
import { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiFilter,
  FiSliders,
  FiGrid,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiInbox,
  FiImage,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import ImageCarousel from "./ImageCarousel";

// =====================================================
// ITEM IMAGE COMPONENT
// =====================================================

function ItemImage({ item, viewMode }) {
  const isGrid = viewMode === "grid";

  return (
    <ImageCarousel
      images={item.images}
      alt={item.itemName || "Item image"}
      className={isGrid ? "w-full" : "w-24 sm:w-32"}
      imageClassName={
        isGrid
          ? "h-40 w-full rounded-lg"
          : "h-24 w-24 rounded-lg sm:h-28 sm:w-32"
      }
      fallback={
        <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
          <FiImage size={24} />
          <span className="text-[10px]">No image available</span>
        </div>
      }
    />
  );
}

// =====================================================
// ITEMS CONTAINER
// =====================================================

function ItemsContainer({
  items = [],
  loading = false,
  error = null,
  onRetry,
  onItemClick,
  canOpenAnyItem = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [reportType, setReportType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // =====================================================
  // DYNAMIC CATEGORIES FROM DATABASE
  // =====================================================

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      items.map((item) => item.category).filter(Boolean)
    );

    return [...uniqueCategories].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [items]);

  // =====================================================
  // SEARCH, FILTER AND SORT
  // =====================================================

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = items.filter((item) => {
      const searchableText = [
        item.itemName,
        item.description,
        item.location,
        item.locationDetails,
        item.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesCategory =
        category === "all" || item.category === category;

      const matchesType =
        reportType === "all" || item.type === reportType;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType
      );
    });

    const getDate = (item) => {
      if (!item.dateOccurred) return 0;

      const timestamp = new Date(
        item.dateOccurred
      ).getTime();

      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    return result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            getDate(a) - getDate(b) ||
            a.id - b.id
          );

        case "location":
          return (a.location || "").localeCompare(
            b.location || ""
          );

        case "newest":
        default:
          return (
            getDate(b) - getDate(a) ||
            b.id - a.id
          );
      }
    });
  }, [items, searchQuery, category, reportType, sortBy]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / itemsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * itemsPerPage;

  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const resetPage = () => setCurrentPage(1);

  // =====================================================
  // FORMAT ITEM DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    // The backend currently stores dateOccurred as DATE.
    // Remove the time rather than displaying midnight.
    return String(date).split("T")[0];
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="border border-gray-300 flex-1 m-1 p-4 rounded-xl bg-white/50 flex flex-col gap-3 min-h-0">

      {/* ============================================= */}
      {/* TOP BAR                                      */}
      {/* ============================================= */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">

        {/* SEARCH */}

        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 rounded-lg shadow-sm">
          <FiSearch
            className="text-[#cead5e] shrink-0"
            size={16}
          />

          <input
            type="search"
            placeholder="Search by name, description or location..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              resetPage();
            }}
            className="w-full bg-transparent border-none outline-none text-xs text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* FILTER CONTROLS */}

        <div className="flex items-center gap-2 flex-wrap">

          {/* CATEGORY FILTER */}

          <div className="flex items-center gap-1.5 bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#152862] shadow-sm">
            <FiFilter className="text-[#cead5e]" />

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                resetPage();
              }}
              className="bg-transparent border-none outline-none cursor-pointer text-xs max-w-36"
            >
              <option value="all">All Categories</option>

              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* LOST / FOUND FILTER */}

          <div className="flex items-center bg-white border border-gray-300 px-2 py-1.5 rounded-lg shadow-sm">
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                resetPage();
              }}
              className="bg-transparent border-none outline-none cursor-pointer text-xs font-semibold text-[#152862]"
            >
              <option value="all">All Reports</option>
              <option value="LOST">Lost Items</option>
              <option value="FOUND">Found Items</option>
            </select>
          </div>

          {/* SORT */}

          <div className="flex items-center gap-1.5 bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#152862] shadow-sm">
            <FiSliders className="text-[#cead5e]" />

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                resetPage();
              }}
              className="bg-transparent border-none outline-none cursor-pointer text-xs"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="location">By Location</option>
            </select>
          </div>

          {/* GRID / LIST TOGGLE */}

          <div className="relative flex items-center bg-linear-to-b from-gray-300 via-gray-200 to-gray-300 p-1 rounded-lg border border-gray-400/60 shadow-inner">

            <div
              className={`
                absolute top-1 bottom-1
                w-[calc(50%-4px)]
                rounded-sm
                shadow-[0_2px_4px_rgba(0,0,0,0.15)]
                border-t border-white/80 border-b
                bg-linear-to-b from-white via-gray-100 to-gray-300
                transition-transform duration-300
                ${
                  viewMode === "grid"
                    ? "translate-x-0"
                    : "translate-x-full"
                }
              `}
            />

            <button
              type="button"
              title="Grid view"
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
              className={`
                relative z-10 px-3 py-1.5
                rounded-md cursor-pointer
                ${
                  viewMode === "grid"
                    ? "text-[#152862]"
                    : "text-gray-600"
                }
              `}
            >
              <FiGrid size={16} />
            </button>

            <button
              type="button"
              title="List view"
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
              className={`
                relative z-10 px-3 py-1.5
                rounded-md cursor-pointer
                ${
                  viewMode === "list"
                    ? "text-[#152862]"
                    : "text-gray-600"
                }
              `}
            >
              <FiList size={16} />
            </button>

          </div>
        </div>
      </div>

      {/* RESULTS COUNT */}

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          {loading
            ? "Loading items..."
            : `${filteredItems.length} item${
                filteredItems.length === 1 ? "" : "s"
              } found`}
        </span>
      </div>

      <hr className="border-t border-gray-200 my-1" />

      {/* ============================================= */}
      {/* MAIN CONTENT                                 */}
      {/* ============================================= */}

      <div className="flex-1 overflow-y-auto min-h-0">

        {/* LOADING */}

        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-[#152862]">
            <FiLoader
              size={32}
              className="animate-spin"
            />
            <p className="text-sm font-semibold">
              Loading items...
            </p>
          </div>
        ) : error ? (

          /* ERROR */

          <div className="h-full flex flex-col items-center justify-center text-center gap-3 p-6">

            <FiAlertCircle
              size={40}
              className="text-red-500"
            />

            <p className="text-sm font-bold text-gray-700">
              Unable to load items
            </p>

            <p className="text-xs text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#152862] text-white text-xs font-semibold hover:opacity-90 cursor-pointer"
            >
              <FiRefreshCw size={14} />
              Try Again
            </button>

          </div>
        ) : currentItems.length === 0 ? (

          /* EMPTY STATE */

          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <FiInbox
              size={48}
              className="text-gray-300 mb-2"
            />

            <p className="text-sm font-bold text-gray-600">
              No items found
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (

          /* ITEM GRID / LIST */

          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                : "flex flex-col gap-3"
            }
          >
            {currentItems.map((item) => {
              const imageUrl = item.images?.[0];
              const canOpenItem =
                typeof onItemClick === "function" &&
                (canOpenAnyItem ||
                  String(item.type || "").toUpperCase() === "FOUND");

              return (
                <div
                  key={item.id}
                  role={canOpenItem ? "button" : undefined}
                  tabIndex={canOpenItem ? 0 : undefined}
                  aria-label={
                    canOpenItem
                      ? `${canOpenAnyItem ? "View details for" : "View claim form for"} ${item.itemName || "item"}`
                      : undefined
                  }
                  onClick={() => canOpenItem && onItemClick(item)}
                  onKeyDown={(event) => {
                    if (
                      canOpenItem &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      onItemClick(item);
                    }
                  }}
                  className={`
                    bg-white border border-gray-200 p-3
                    rounded-xl shadow-sm
                    hover:border-[#cead5e]
                    hover:shadow-md
                    transition-all duration-200
                    ${canOpenItem ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#152862]" : ""}
                    ${
                      viewMode === "grid"
                        ? "flex flex-col gap-3"
                        : "flex flex-row items-start gap-3"
                    }
                  `}
                >

                  {/* ITEM IMAGE */}

                  <ItemImage
                    key={`${item.id}-${imageUrl || "none"}`}
                    item={item}
                    viewMode={viewMode}
                  />

                  {/* ITEM DETAILS */}

                  <div className="flex-1 min-w-0 flex flex-col">

                    {/* ITEM NAME */}

                    <h4 className="font-bold text-sm text-[#152862] line-clamp-2">
                      {item.itemName}
                    </h4>

                    {/* TYPE AND STATUS */}

                    <div className="flex items-center gap-2 mt-2 flex-wrap">

                      <span
                        className={`
                          text-[10px] font-bold
                          px-2 py-0.5 rounded-full
                          ${
                            item.type === "LOST"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }
                        `}
                      >
                        {item.type}
                      </span>

                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {item.status}
                      </span>

                    </div>

                    {/* DESCRIPTION */}

                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {item.description || "No description provided."}
                    </p>

                    {/* CATEGORY */}

                    <p className="text-[11px] text-gray-500 mt-2">
                      <span className="font-semibold">
                        Category:
                      </span>{" "}
                      {item.category || "Other"}
                    </p>

                    {/* LOCATION */}

                    <div className="flex items-start gap-1.5 mt-2 text-[11px] text-gray-500">
                      <FiMapPin
                        size={13}
                        className="text-[#cead5e] shrink-0"
                      />

                      <span className="line-clamp-1">
                        {item.location || "Unknown location"}
                      </span>
                    </div>

                    {/* DATE */}

                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400 font-semibold">
                      <FiCalendar
                        size={13}
                        className="shrink-0"
                      />

                      <span>
                        {formatDate(item.dateOccurred)}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ============================================= */}
      {/* PAGINATION                                   */}
      {/* ============================================= */}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600">

          <span>
            Page{" "}
            <strong className="text-[#152862]">
              {safePage}
            </strong>
            {" "}of{" "}
            <strong className="text-[#152862]">
              {totalPages}
            </strong>
          </span>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={handlePrevPage}
              disabled={safePage === 1}
              aria-label="Previous page"
              className={`
                p-1.5 rounded-lg border border-gray-300
                flex items-center justify-center transition-all
                ${
                  safePage === 1
                    ? "opacity-40 cursor-not-allowed bg-gray-100"
                    : "bg-white hover:bg-gray-100 text-[#152862] cursor-pointer"
                }
              `}
            >
              <FiChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={safePage >= totalPages}
              aria-label="Next page"
              className={`
                p-1.5 rounded-lg border border-gray-300
                flex items-center justify-center transition-all
                ${
                  safePage >= totalPages
                    ? "opacity-40 cursor-not-allowed bg-gray-100"
                    : "bg-white hover:bg-gray-100 text-[#152862] cursor-pointer"
                }
              `}
            >
              <FiChevronRight size={16} />
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default ItemsContainer;
