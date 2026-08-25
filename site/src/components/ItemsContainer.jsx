import { useState } from "react";
import { 
  FiSearch, 
  FiFilter, 
  FiSliders, 
  FiGrid, 
  FiList, 
  FiChevronLeft, 
  FiChevronRight, 
  FiInbox 
} from "react-icons/fi";

function ItemsContainer({ items = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter & Search Logic
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = category === "all" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  // Calculate Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="border border-gray-300 flex-1 m-1 p-4 rounded-xl bg-white/50 flex flex-col gap-3 min-h-0">
      
      {/* Top Bar: Search + Filter + Sort + View Mode */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 rounded-lg shadow-sm">
          <FiSearch className="text-[#cead5e]" size={16} />
          <input
            type="text"
            placeholder="Search items by name, description, or location..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
            className="w-full bg-transparent border-none outline-none text-xs text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Controls Container */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#152862] shadow-sm">
            <FiFilter className="text-[#cead5e]" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none outline-none cursor-pointer text-xs"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="cards">ID & Cards</option>
              <option value="keys">Keys & Wallets</option>
              <option value="bags">Bags & Clothing</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#152862] shadow-sm">
            <FiSliders className="text-[#cead5e]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-xs"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="location">By Location</option>
            </select>
          </div>

          {/* Grid/List View Toggles */}
          <div className="relative flex items-center bg-linear-to-b from-gray-300 via-gray-200 to-gray-300 p-1 rounded-lg border border-gray-400/60 shadow-inner">
  
            {/* Metallic Silver Sliding Pill */}
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.15)] border-t border-white/80 border-b bg-linear-to-b from-white via-gray-100 to-gray-300 transition-transform duration-400 ease-out ${viewMode === "grid" ? "translate-x-0" : "translate-x-full"}`} />

            {/* Grid View Button */}
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`relative z-10 flex-1 px-3 py-1.5 rounded-md text-xs flex items-center justify-center transition-colors duration-200 cursor-pointer ${
                viewMode === "grid" 
                  ? "text-[#152862] font-bold drop-shadow-[0_1px_0px_rgba(255,255,255,0.8)]" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FiGrid size={16} />
            </button>
            {/* List View Button */}
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`relative z-10 flex-1 px-3 py-1.5 rounded-md text-xs flex items-center justify-center transition-colors duration-200 cursor-pointer ${
                viewMode === "list" 
                  ? "text-[#152862] font-bold drop-shadow-[0_1px_0px_rgba(255,255,255,0.8)]" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FiList size={16} />
            </button>
            
          </div>

        </div>
      </div>

      {/* Separator Line */}
      <hr className="border-t border-gray-200 my-1" />

      {/* Main Items Display Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {currentItems.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <FiInbox size={48} className="text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-600">No items to show yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          /* Rendered Grid or List Items */
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                : "flex flex-col gap-2"
            }
          >
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:border-[#cead5e] transition-all"
              >
                <h4 className="font-bold text-sm text-[#152862]">{item.title}</h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                <div className="mt-2 text-[11px] text-gray-400 font-semibold flex justify-between">
                  <span>{item.location}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {filteredItems.length > 0 && (
        <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600">
          <span>
            Page <strong className="text-[#152862]">{currentPage}</strong> of{" "}
            <strong className="text-[#152862]">{totalPages || 1}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border border-gray-300 flex items-center justify-center transition-all ${
                currentPage === 1
                  ? "opacity-40 cursor-not-allowed bg-gray-100"
                  : "bg-white hover:bg-gray-100 text-[#152862] cursor-pointer"
              }`}
            >
              <FiChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-1.5 rounded-lg border border-gray-300 flex items-center justify-center transition-all ${
                currentPage === totalPages || totalPages === 0
                  ? "opacity-40 cursor-not-allowed bg-gray-100"
                  : "bg-white hover:bg-gray-100 text-[#152862] cursor-pointer"
              }`}
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