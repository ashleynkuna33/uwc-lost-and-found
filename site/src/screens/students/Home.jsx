import { useState } from "react";
import { FaHandHoldingHeart } from "react-icons/fa";
import { FiPlusCircle, FiSearch, FiMapPin, FiX } from "react-icons/fi";

import homeP1 from "../../assets/homeP1.png";
import homeP2 from "../../assets/homeP2.jpg";
import homeP3 from "../../assets/homeP3.jpg";

function Home({ setView }) {
  const [activeImage, setActiveImage] = useState(null);

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#eaf1f7]">
      {/* Header */}
      <div className="flex justify-center p-6 bg-[#152862] border-b-4 border-[#cead5e] shadow-md">
        <h1 className="font-bold text-white text-2xl tracking-wide">
          UWC LOST ITEMS SYSTEM
        </h1>
      </div>

      {/* Navigation Section */}
      <div className="mx-4 mt-4 p-4 bg-white border border-gray-300 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[#152862]">
          <FaHandHoldingHeart size={24} className="text-[#cead5e]" />
          <h2 className="text-xl font-bold">Navigate:</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setView?.("My Reports")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#cead5e] text-[#152862] font-bold text-xs rounded-xl shadow transition-all duration-150 hover:bg-[#b89a50] hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <FiPlusCircle size={18} />
            <span>REPORT LOST ITEM</span>
          </button>

          <button
            type="button"
            onClick={() => setView?.("Find Items")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#152862] text-white font-bold text-xs rounded-xl shadow transition-all duration-150 hover:bg-[#0e1b42] hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <FiSearch size={18} className="text-[#cead5e]" />
            <span>FIND LOST ITEM</span>
          </button>
        </div>
      </div>

      {/* Main 2-Grid Content Area */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 p-4 gap-4">
        {/* Left Column: Report / Found Feed */}
        <div onClick={() => setView("Find Items")} className="bg-white border border-gray-300 rounded-xl p-4 overflow-y-auto h-full shadow-sm flex flex-col gap-3 cursor-pointer transition-all duration-100 hover:scale-101">
          <h3 className="font-bold text-base text-[#152862] border-b pb-2">
            Recently Reported Items
          </h3>
          <p className="text-xs text-gray-500">
            Items logged in the past 24 hours across campus.
          </p>
        </div>

        {/* Right Column: Active Claims / Info */}
        <div className="bg-white border border-gray-300 rounded-xl p-4 overflow-y-auto h-full shadow-sm flex flex-col gap-3">
          <h3 className="font-bold text-base text-[#152862] border-b pb-2">
            Campus Drop-Off Locations
          </h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <FiMapPin className="text-[#cead5e]" /> Main Library Security Desk 08:00 - 21:00 | 08:00 - 13:00 during holidays
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <FiMapPin className="text-[#cead5e]" />CPS Main Gate 24/7
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <FiMapPin className="text-[#cead5e]" /> ResLife 24/7
          </p>
          
          {/* Image Grid */}
          <div className="grid grid-cols-1 gap-3 mt-1">
            <div 
              onClick={() => setActiveImage({ src: homeP1, title: "Main Library Security Desk", time: "08:00 - 21:00 | 08:00 - 13:00 during holidays" })}
              className="overflow-hidden rounded-xl border border-gray-200 cursor-pointer group"
            >
              <img 
                src={homeP1} 
                alt="library help desk" 
                className="w-full h-32 object-cover transition-all duration-200 group-hover:scale-105"
              />
            </div>

            <div 
              onClick={() => setActiveImage({ src: homeP2, title: "CPS Main Gate Security Building", time: "24/7" })}
              className="overflow-hidden rounded-xl border border-gray-200 cursor-pointer group"
            >
              <img 
                src={homeP2} 
                alt="uwc security protection building" 
                className="w-full h-32 object-cover transition-all duration-200 group-hover:scale-105"
              />
            </div>

            <div 
              onClick={() => setActiveImage({ src: homeP3, title: "ResLife Building", time: "24/7" })}
              className="overflow-hidden rounded-xl border border-gray-200 cursor-pointer group"
            >
              <img 
                src={homeP3} 
                alt="ResLife Building" 
                className="w-full h-32 object-cover transition-all duration-200 group-hover:scale-105"
              />
            </div>


          </div>
        </div>
      </div>

      {/* Big View Modal */}
      {activeImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setActiveImage(null)}
        >
          <div 
            className="relative bg-white p-2 rounded-2xl max-w-3xl w-full flex flex-col items-center gap-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
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
            <span className="text-sm font-bold text-[#152862]">{activeImage.time}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;