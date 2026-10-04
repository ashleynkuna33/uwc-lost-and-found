import { FiEdit, FiTrash2 } from "react-icons/fi";

function ReportCard({ report }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">

            {/* Report title */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-semibold text-[#152862]">
                        📱 {report.item}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        {report.type} Item
                    </p>
                </div>

                {/* Status */}
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                    🟡 {report.status}
                </span>
            </div>

            {/* Report information */}
            <div className="space-y-2 mb-5">

                <p className="text-gray-700">
                    <span className="font-semibold">Type:</span>{" "}
                    {report.type}
                </p>

                <p className="text-gray-700">
                    <span className="font-semibold">Location:</span>{" "}
                    {report.location}
                </p>

                <p className="text-gray-700">
                    <span className="font-semibold">Date reported:</span>{" "}
                    {report.date}
                </p>

            </div>

            {/* Buttons */}
            <div className="flex gap-3">

                <button className="flex-1 bg-[#152862] text-white px-4 py-2 rounded-lg hover:bg-[#1d3578] transition">
                    View Details
                </button>

                <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#152862] text-[#152862] hover:bg-[#152862]/10 transition">
                    <FiEdit size={16} />
                    Edit
                </button>

                <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 transition">
                    <FiTrash2 size={16} />
                    Delete
                </button>

            </div>

        </div>
    );
}

export default ReportCard;