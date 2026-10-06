import { FiUser } from "react-icons/fi";
import { CiLogout } from "react-icons/ci";
import ReportCard from "../../components/ReportCard";

function Reports() {

    const reports = [
        {
            id: 1,
            item: "iPhone 13",
            type: "Lost",
            location: "UWC Library",
            date: "2 October 2026",
            status: "Searching"
        }
    ];

    return(
        <div className="flex-1 flex flex-col h-full min-h-0 p-4 overflow-y-auto bg-[#eaf1f7]">

            {/* Top user section */}
            <div className="flex justify-between items-center p-2 gap-2">
                {/* title */}
                <div>
                    <h1 className="md:text-2xl font-bold text-[#152862]">My Reports</h1>
                    <p className="text-gray-600 mt-1 text-sm md:text-md">View and manage your lost and found item reports.</p>
                </div>

                {/* user section */}
                <div className="flex flex-row items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#152862]/10 px-3 py-1 rounded-full font-semibold text-[#152862]">
                    <FiUser className="text-[#cead5e] hidden md:block" size={22} />
                    <span className="text-sm md:text-md">
                        Logged in as:{" "}
                        <strong className="text-black text-sm md:text-md">4429119</strong>
                    </span>
                </div>

                <CiLogout 
                    size={30} 
                    color="#f14c53" 
                    className="cursor-pointer"
                />
                </div>
                
            </div>


            {/* Reports section */}
            <div className="mt-6 px-2">


                {/* Report cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {reports.map((report) => (
                        <ReportCard 
                            key={report.id} 
                            report={report} 
                        />
                    ))}

                </div>

            </div>

        </div>
    )
}

export default Reports;