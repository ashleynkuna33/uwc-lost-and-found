
import { useState } from "react";
import { FiInbox, FiBell, FiFileText } from "react-icons/fi";
import { FaPlus, FaMagnifyingGlass } from "react-icons/fa6";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaRegCheckCircle, FaRegClock } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";

// stats card
const StatCard = ({ icon: Icon, iconColor = "#2650aa", iconBgColor = "#eaf1f7", number = 0, text = "",}) => {
  return (
    <div className="flex items-center gap-4 rounded-md bg-white px-4 py-3 shadow-md">
      <div
        className="rounded-full p-2.5"
        style={{ backgroundColor: iconBgColor }}
      >
        <Icon size={28} color={iconColor} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#152862]">
          {number}
        </h2>
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
};

function Reports({ reports = [], notifications = [], renderReport, reportDetails, onNewReport, onMarkAllRead, }) {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");


  const totalReports = reports.length;
  const openReports = reports.filter((report) => report.status?.toLowerCase() === "open").length;
  const returnedReports = reports.filter((report) => report.status?.toLowerCase() === "returned").length;
  const lostReports = reports.filter((report) => report.type?.toLowerCase() === "lost").length;
  const foundReports = reports.filter((report) => report.type?.toLowerCase() === "found").length;
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  // Available status filters
  const statuses = [
    ...new Set(reports.map((report) => report.status).filter(Boolean)),
  ];

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const type = String(report.type ?? "").toLowerCase();
    const status = String(report.status ?? "").toLowerCase();
    const itemName = String(report.itemName ?? report.title ?? report.name ?? "").toLowerCase();
    const reportId = String(report.id ?? "").toLowerCase();
    const query = search.trim().toLowerCase();
    const matchesTab =activeTab === "All" || type === activeTab.toLowerCase();
    const matchesSearch = itemName.includes(query) || reportId.includes(query);
    const matchesStatus = selectedStatus === "All" || status === selectedStatus.toLowerCase();
    return matchesTab && matchesSearch && matchesStatus;
  });

  const tabs = [
    { name: "All", count: totalReports },
    { name: "Lost", count: lostReports },
    { name: "Found", count: foundReports },
  ];

  return (
    <div className="min-h-screen w-full bg-[#eaf1f7] p-4 md:p-6">
      <div className="flex w-full flex-col">

        {/* title */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#152862] md:text-3xl">My Reports</h1>
            <p className="mt-1 text-sm text-gray-600 md:text-base">Manage your lost and found reports and respond to updates.</p>
          </div>

          <button type="button" onClick={onNewReport} className="flex shrink-0 cursor-pointer items-center gap-2 rounded-md bg-[#152862] px-3 py-2.5 text-white shadow-sm transition-all duration-150 hover:opacity-90" >
            <FaPlus size={17} />
            <span className="hidden text-sm font-semibold sm:block">New Report</span>
          </button>
        </div>

        {/* quick statistics */}
        <div className="my-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard icon={IoDocumentTextOutline} iconColor="#2650aa" iconBgColor="#eaf1f7" number={totalReports} text="Total reports"/>
          <StatCard icon={FaRegClock} iconColor="#663300" iconBgColor="#fff0d9" number={openReports} text="Open reports"/>
          <StatCard icon={FaRegCheckCircle} iconColor="#01461c" iconBgColor="#e4f4ea" number={returnedReports} text="Returned items"/>
        </div>

        {/* body */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5">

          {/* left */}
          <section className="rounded-lg bg-white p-4 shadow-md lg:col-span-3 md:p-5">
            <h2 className="text-xl font-bold text-[#152862]">My Reports</h2>

            {/* tabs */}
            <div className="mt-4 flex gap-5 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  type="button"
                  onClick={() => setActiveTab(tab.name)}
                  className={`cursor-pointer border-b-[3px] px-3 pb-2 text-sm font-semibold transition-colors ${
                    activeTab === tab.name
                      ? "border-[#dba621] text-[#152862]"
                      : "border-transparent text-gray-500 hover:text-[#152862]"
                  }`}
                >
                  {tab.name} ({tab.count})
                </button>
              ))}
            </div>

            {/* SEARCH AND STATUS FILTER */}
            <div className="my-4 flex flex-col gap-3 sm:flex-row">

              {/* search input */}
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-gray-300 px-3 py-2.5 focus-within:border-[#2650aa]">
                <FaMagnifyingGlass size={17} className="shrink-0 text-gray-500"/>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by item or report ID..." aria-label="Search reports" className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-gray-400"/>
              </div>

              {/* status */}
              <div className="relative w-full sm:w-44">
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} aria-label="Filter reports by status" className="w-full cursor-pointer appearance-none rounded-md border border-gray-300 bg-white px-3 py-2.5 pr-9 text-sm text-gray-700 outline-none focus:border-[#2650aa]"
                >
                  <option value="All">All statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <IoIosArrowDown size={17} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#152862]"/>
              </div>
            </div>

            {/* data */}
            <div className="flex flex-col gap-3">

              {filteredReports.length === 0 ? (
                /* EMPTY STATE */
                <div className="flex min-h-72 flex-col items-center justify-center px-4 py-10 text-center">

                  <div className="mb-4 rounded-full bg-[#eaf1f7] p-5">
                    <FiInbox
                      size={42}
                      className="text-[#2650aa]"
                    />
                  </div>

                  <h3 className="text-lg font-bold text-[#152862]">
                    {totalReports === 0 ? "No reports yet" : "No matching reports"} </h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                    {totalReports === 0
                      ? "You haven't submitted any lost or found reports yet. Create your first report to get started."
                      : "No reports match your current filters. Try changing your search or filter options."}
                  </p>

                  {totalReports === 0 && (
                    <button type="button" onClick={onNewReport} className="mt-5 flex cursor-pointer items-center gap-2 rounded-md bg-[#152862] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#233e83]"
                    >
                      <FaPlus size={13} /> Create a Report</button>
                  )}

                  {totalReports > 0 && (
                    <button type="button" onClick={() => { setActiveTab("All"); setSearch(""); setSelectedStatus("All");}} className="mt-4 cursor-pointer text-sm font-semibold text-[#2650aa] hover:underline"
                    >Clear filters</button>
                    )}
                </div>
              ) : (
                // components
                filteredReports.map((report, index) => (
                  <div key={report.id ?? index}>
                    {renderReport
                      ? renderReport(report)
                      : null}
                  </div>
                ))
              )}

            </div>

            {/* footer */}
            <div className="mt-4 border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500">
                Showing {filteredReports.length} of {totalReports} reports
              </p>
            </div>
          </section>

          {/* current report item */}
          <aside className="flex flex-col gap-4 lg:col-span-2">

            {/* notification */}
            <section className="rounded-lg bg-white p-4 shadow-md md:p-5">

              {/* NOTIFICATIONS HEADER */}
              <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#152862]">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && onMarkAllRead && (
                  <button type="button" onClick={onMarkAllRead} className="cursor-pointer text-xs font-medium text-[#2650aa] underline"
                  >Mark all read</button>
                )}
              </div>

              {/* content */}
              <div>
                {notifications.length === 0 ? (
                  <div className="flex min-h-48 flex-col items-center justify-center px-3 py-8 text-center">
                    <div className="mb-3 rounded-full bg-[#eaf1f7] p-4">
                      <FiBell size={30} className="text-[#2650aa]"/>
                    </div>
                    <h3 className="text-sm font-semibold text-[#152862]">No notifications yet</h3>
                    <p className="mt-1 max-w-xs text-xs leading-5 text-gray-500"> You're all caught up! Updates about your reports and claims will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification, index) => (
                      <div
                        key={notification.id ?? index}
                        className="flex gap-3 py-3"
                      >
                        <div className="pt-1.5">
                          <span
                            className={`block h-2.5 w-2.5 rounded-full ${
                              notification.read
                                ? "bg-gray-300"
                                : "bg-blue-500"
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-[#152862]">
                              {notification.title}
                            </h4>

                            <span className="shrink-0 text-xs text-gray-500">
                              {notification.time}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-gray-600">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* REPORT DETAILS */}
            <section className="rounded-lg bg-white p-4 shadow-md md:p-5">

              <h2 className="border-b border-gray-200 pb-3 text-lg font-bold text-[#152862]">Report details</h2>

              {/* details placeholder */}
              {reportDetails ? (
                reportDetails
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center px-4 py-8 text-center">

                  <div className="mb-4 rounded-full bg-[#eaf1f7] p-4">
                    <FiFileText size={32} className="text-[#2650aa]"/>
                  </div>
                  <h3 className="text-sm font-semibold text-[#152862]">No report selected</h3>
                  <p className="mt-2 max-w-xs text-xs leading-5 text-gray-500">
                    {totalReports === 0
                      ? "Once you've submitted a report, you can view and manage its details here."
                      : "Select a report from your list to view or edit its details."}
                  </p>
                </div>
              )}
            </section>

          </aside>
        </div>
      </div>
    </div>
  );
}

export default Reports;
