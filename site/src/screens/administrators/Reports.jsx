import { useEffect, useState, useRef } from "react";
import { FiUser, FiInbox, FiImage, FiCheck, FiX, FiMessageCircle, FiSend, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { SlCalender } from "react-icons/sl";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaRegCheckCircle, FaRegClock } from "react-icons/fa";
import { RiErrorWarningLine } from "react-icons/ri";

// stats card
const StatCard = ({ icon: Icon, iconColor = "#2650aa", iconBgColor = "#eaf1f7", number = 0, text = "" }) => {
  return (
    <div className="flex items-center gap-4 rounded-md bg-white px-4 py-3 shadow-md">
      <div className="rounded-full p-2.5" style={{ backgroundColor: iconBgColor }}>
        <Icon size={28} color={iconColor}/>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[#152862]">{number}</h2>
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
};

const emptyReports = [];

const getStatus = (status) => {
  const value = String(status ?? "Pending").trim().toLowerCase();
  if (value === "pending review" || value === "open") return "Pending";
  if (value === "needs student action" || value === "information requested") return "Needs Info";
  const statuses = { "pending": "Pending", "in review": "In Review", "needs info": "Needs Info", "approved": "Approved", "rejected": "Rejected", "resolved": "Resolved" };
  return statuses[value] ?? status;
};

const getDate = (date) => {
  if (!date) return "Not provided";
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? String(date) : value.toLocaleString("en-ZA", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const getPhotos = (report) => {
  if (!report) return [];
  const photos = report.photos ?? report.images ?? (report.image ? [report.image] : []);
  return (Array.isArray(photos) ? photos : [photos]).map((photo) => typeof photo === "string" ? photo : photo?.url).filter(Boolean);
};

const StatusBadge = ({ status }) => {
  const value = getStatus(status);
  const colors = {
    "Pending": "bg-amber-100 text-amber-800",
    "In Review": "bg-blue-100 text-blue-700",
    "Needs Info": "bg-red-100 text-red-700",
    "Approved": "bg-emerald-100 text-emerald-700",
    "Rejected": "bg-red-100 text-red-700",
    "Resolved": "bg-green-100 text-green-700",
  };
  return <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${colors[value] ?? "bg-gray-100 text-gray-700"}`}>{value}</span>;
};

export default function Reports({ reports = emptyReports, onUpdateReport, onSendNotification }) {
  const [reportList, setReportList] = useState(reports);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { setReportList(reports); }, [reports]);

  const totalReports = reportList.length;
  const pendingReports = reportList.filter((report) => getStatus(report.status) === "Pending").length;
  const needsInfoReports = reportList.filter((report) => getStatus(report.status) === "Needs Info").length;
  const resolvedReports = reportList.filter((report) => getStatus(report.status) === "Resolved").length;

  const tabs = ["All", "Pending", "In Review", "Needs Info", "Approved", "Rejected", "Resolved"].map((name) => ({
    name,
    count: name === "All" ? totalReports : reportList.filter((report) => getStatus(report.status) === name).length,
  }));

  
  const tabsRef = useRef(null);
  const tabRefs = useRef({});

  // scroll to active tab
  useEffect(() => {
    const container = tabsRef.current;
    const activeButton = tabRefs.current[activeTab];

    if (!container || !activeButton) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    const scrollLeft =
      container.scrollLeft +
      buttonRect.left -
      containerRect.left -
      (container.clientWidth - buttonRect.width) / 2;

    container.scrollTo({
      left: scrollLeft,
      behavior: "smooth",
    });
  }, [activeTab]);


  // filter reports
  const filteredReports = reportList.filter((report) => {
    const status = getStatus(report.status);
    const type = String(report.type ?? "").toLowerCase();
    const query = search.trim().toLowerCase();
    const matchesTab = activeTab === "All" || status === activeTab;
    const matchesStatus = selectedStatus === "All" || status === selectedStatus;
    const matchesType = selectedType === "All" || type === selectedType.toLowerCase();
    const matchesSearch = [report.id, report.itemName, report.title, report.studentNumber, report.category, report.location].some((value) => String(value ?? "").toLowerCase().includes(query));
    return matchesTab && matchesStatus && matchesType && matchesSearch;
  });

  const selectedReport = reportList.find((report) => report.id === selectedReportId) ?? reportList[0] ?? null;
  const selectedIndex = reportList.findIndex((report) => report.id === selectedReport?.id);
  const photos = getPhotos(selectedReport);
  const activity = selectedReport?.activity ?? [];
  const today = new Date().toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const clearFilters = () => { setActiveTab("All"); setSearch(""); setSelectedStatus("All"); setSelectedType("All"); };
  const selectReport = (report) => { setSelectedReportId(report.id); setSelectedPhoto(0); setMessage(""); setConfirmStatus(""); setNotice(""); setError(""); };

  // process report
  const updateReport = async (status) => {
    if (!selectedReport || saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (onUpdateReport) await onUpdateReport(selectedReport.id, { status });
      setReportList((current) => current.map((report) => report.id === selectedReport.id ? {
        ...report,
        status,
        activity: [{ title: `Report marked ${status.toLowerCase()}`, date: new Date().toISOString() }, ...(report.activity ?? [])],
      } : report));
      setConfirmStatus("");
      setNotice(onUpdateReport ? "Report updated successfully." : "Report updated locally. Connect onUpdateReport to save changes.");
      if (status === "Needs Info" && !message.trim()) setMessage("Please provide more details or clearer photos to help us review your report.");
    } catch (err) {
      setError(err?.message ?? "Could not update the report.");
    } finally {
      setSaving(false);
    }
  };

  // send notification
  const sendNotification = async () => {
    if (!selectedReport || !message.trim() || sending) return;
    setError("");
    setNotice("");
    if (!onSendNotification) { setError("Connect onSendNotification to send messages to students."); return; }
    setSending(true);
    try {
      await onSendNotification(selectedReport.id, { studentNumber: selectedReport.studentNumber, message: message.trim() });
      setMessage("");
      setNotice("Notification sent successfully.");
    } catch (err) {
      setError(err?.message ?? "Could not send the notification.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#eaf1f7] p-4 md:p-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#152862] md:text-3xl">Process Student Reports</h1>
          <p className="mt-1 text-sm text-gray-600 md:text-base">Browse, review, and process lost and found reports submitted by students</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* date card */}
          <div className="flex items-center gap-1.5 rounded-md bg-[#516f88]/20 px-3 py-2">
            <SlCalender size={19}/>
            <p className="text-sm font-semibold text-gray-600">{today}</p>
          </div>
          {/* user icon */}
          <div className="flex items-center gap-1.5 rounded-md bg-[#516f88]/20 px-3 py-2">
            <FiUser size={20}/>
            <p className="hidden text-sm font-semibold text-gray-600 sm:block">Logged in as Administrator</p>
          </div>
        </div>
      </div>

      {/* quick stats */}
      <div className="my-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IoDocumentTextOutline} number={totalReports} text="Total Reports"/>
        <StatCard icon={FaRegClock} iconColor="#663300" iconBgColor="#fff0d9" number={pendingReports} text="Pending Review"/>
        <StatCard icon={RiErrorWarningLine} number={needsInfoReports} text="Needs Student Action"/>
        <StatCard icon={FaRegCheckCircle} iconColor="#01461c" iconBgColor="#e4f4ea" number={resolvedReports} text="Resolved"/>
      </div>

      {/* body */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.1fr_1fr]">
        {/* reports */}
        <div className="min-w-0 rounded-lg bg-white p-4 shadow-md md:p-5">
          <h2 className="text-xl font-bold text-[#152862]">Student Reports</h2>

          {/* tabs */}
          <div ref={tabsRef} className="mt-4 flex gap-2 overflow-x-auto border-b border-gray-200 scrollbar-none [&::-webkit-scrollbar]:hidden" >
            {tabs.map((tab) => (
              <button
                key={tab.name}
                ref={(el) => { tabRefs.current[tab.name] = el; }}
                type="button"
                onClick={() => setActiveTab(tab.name)}
                className={`shrink-0 cursor-pointer border-b-[3px] px-3 pb-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.name
                    ? "border-[#dba621] text-[#152862]"
                    : "border-transparent text-gray-500 hover:text-[#152862]"
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </div>

          {/* search, filter status, item type, clear filter btn */}
          <div className="my-4 flex flex-wrap gap-2">
            {/* search input */}
            <div className="flex min-w-56 flex-1 items-center gap-3 rounded-md border border-gray-300 px-3 py-2.5 focus-within:border-[#2650aa]">
              <FaMagnifyingGlass size={16} className="shrink-0 text-gray-500"/>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ID, student number or item..." aria-label="Search reports" className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-gray-400"/>
            </div>
            {/* status */}
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} aria-label="Filter by status" className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none">
              <option value="All">All statuses</option>
              {tabs.slice(1).map((tab) => <option key={tab.name} value={tab.name}>{tab.name}</option>)}
            </select>
            {/* type */}
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} aria-label="Filter by type" className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none">
              <option value="All">All item types</option>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>
            <button type="button" onClick={clearFilters} className="cursor-pointer rounded-md bg-[#eaf1f7] px-3 py-2.5 text-sm font-medium text-[#152862] hover:bg-gray-200">Clear</button>
          </div>

          {/* report list */}
          <div className="flex flex-col gap-2">
            {filteredReports.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-4 text-center">
                <div className="mb-3 rounded-full bg-[#eaf1f7] p-4"><FiInbox size={32} className="text-[#2650aa]"/></div>
                <h3 className="font-semibold text-[#152862]">{totalReports === 0 ? "No student reports yet" : "No reports found"}</h3>
                <p className="mt-2 max-w-xs text-sm text-gray-500">{totalReports === 0 ? "Student submissions will appear here when reports are available." : "Try changing your search or clearing the filters."}</p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const image = getPhotos(report)[0];
                return (
                  <div key={report.id} className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 transition-colors ${selectedReport?.id === report.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                    {image ? <img src={image} alt={report.itemName ?? report.title ?? "Reported item"} className="h-16 w-16 rounded-md object-cover"/> : <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#eaf1f7]"><FiImage size={24} className="text-[#2650aa]"/></div>}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[#152862]">{report.itemName ?? report.title ?? "Unnamed item"}</h3>
                      <p className="mt-1 text-xs text-gray-500">{report.id} · Student {report.studentNumber ?? "Not provided"}</p>
                      <p className="mt-1 text-xs text-gray-500">{report.type ?? "Report"} · {report.location ?? "Location not provided"}</p>
                    </div>
                    <div className="flex flex-col gap-2"><p className="text-xs text-gray-500">{getDate(report.dateSubmitted ?? report.createdAt ?? report.date)}</p><StatusBadge status={report.status}/></div>
                    <button type="button" onClick={() => selectReport(report)} className="cursor-pointer rounded-md bg-[#152862] px-4 py-2 text-sm font-semibold text-white hover:bg-[#233e83]">Review</button>
                  </div>
                );
              })
            )}
          </div>
          <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">Showing {filteredReports.length} of {totalReports} reports</p>
        </div>

        {/* report details */}
        <div className="min-w-0 rounded-lg bg-white p-4 shadow-md md:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-[#152862]">Report Details</h2>
            <div className="flex gap-2">
              <button type="button" disabled={selectedIndex <= 0} onClick={() => selectReport(reportList[selectedIndex - 1])} aria-label="Previous report" className="rounded-md bg-[#eaf1f7] p-2 text-[#152862] disabled:cursor-not-allowed disabled:opacity-40"><FiChevronLeft/></button>
              <button type="button" disabled={selectedIndex === -1 || selectedIndex >= reportList.length - 1} onClick={() => selectReport(reportList[selectedIndex + 1])} aria-label="Next report" className="rounded-md bg-[#eaf1f7] p-2 text-[#152862] disabled:cursor-not-allowed disabled:opacity-40"><FiChevronRight/></button>
            </div>
          </div>

          {!selectedReport ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
              <div className="mb-3 rounded-full bg-[#eaf1f7] p-4"><IoDocumentTextOutline size={32} color="#2650aa"/></div>
              <h3 className="font-semibold text-[#152862]">No report selected</h3>
              <p className="mt-2 max-w-xs text-sm text-gray-500">Select a student report to review its details and process it.</p>
            </div>
          ) : (
            <>
              {/* item information */}
              <div className="mt-5 flex flex-col gap-4 sm:flex-row">
                <div className="flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#eaf1f7] sm:w-36">
                  {photos.length ? <img src={photos[selectedPhoto] ?? photos[0]} alt={selectedReport.itemName ?? "Item"} className="h-full w-full object-cover"/> : <FiImage size={40} className="text-[#2650aa]"/>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-[#152862]">{selectedReport.itemName ?? selectedReport.title ?? "Unnamed item"}</h3>
                    <StatusBadge status={selectedReport.status}/>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-gray-500">Report ID</p><p className="font-medium text-[#152862]">{selectedReport.id}</p></div>
                    <div><p className="text-xs text-gray-500">Student Number</p><p className="font-medium text-[#152862]">{selectedReport.studentNumber ?? "Not provided"}</p></div>
                    <div><p className="text-xs text-gray-500">Item Type</p><p className="font-medium text-[#152862]">{selectedReport.category ?? "Not provided"}</p></div>
                    <div><p className="text-xs text-gray-500">Report Type</p><p className="font-medium text-[#152862]">{selectedReport.type ?? "Not provided"}</p></div>
                    <div><p className="text-xs text-gray-500">Location</p><p className="font-medium text-[#152862]">{selectedReport.location ?? "Not provided"}</p></div>
                    <div><p className="text-xs text-gray-500">Date Submitted</p><p className="font-medium text-[#152862]">{getDate(selectedReport.dateSubmitted ?? selectedReport.createdAt ?? selectedReport.date)}</p></div>
                  </div>
                  <div className="mt-3"><p className="text-sm font-semibold text-[#152862]">Description</p><p className="mt-1 text-sm leading-6 text-gray-600">{selectedReport.description || "No description provided."}</p></div>
                </div>
              </div>

              {/* photos and activity */}
              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-sm font-bold text-[#152862]">Photos ({photos.length})</h3>
                  {photos.length ? (
                    <div className="flex flex-wrap gap-2">
                      {photos.map((photo, index) => <button type="button" key={`${photo}-${index}`} onClick={() => setSelectedPhoto(index)} aria-label={`View photo ${index + 1}`} className={`h-20 w-20 overflow-hidden rounded-md border-2 ${selectedPhoto === index ? "border-blue-500" : "border-transparent"}`}><img src={photo} alt={`Item photo ${index + 1}`} className="h-full w-full object-cover"/></button>)}
                    </div>
                  ) : <p className="text-sm text-gray-500">No photos attached.</p>}
                </div>
                <div className="rounded-md bg-[#eaf1f7]/70 p-3">
                  <h3 className="mb-3 text-sm font-bold text-[#152862]">Recent Activity</h3>
                  <div className="space-y-3">
                    {activity.length ? activity.map((entry, index) => <div key={entry.id ?? index} className="flex gap-2"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#dba621]"/><div><p className="text-sm text-[#152862]">{entry.title ?? entry.message ?? "Report updated"}</p><p className="mt-1 text-xs text-gray-500">{getDate(entry.date ?? entry.createdAt)}</p></div></div>) : <div className="flex gap-2"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#dba621]"/><div><p className="text-sm text-[#152862]">Report submitted by student</p><p className="mt-1 text-xs text-gray-500">{getDate(selectedReport.dateSubmitted ?? selectedReport.createdAt ?? selectedReport.date)}</p></div></div>}
                  </div>
                </div>
              </div>

              {/* admin actions */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h3 className="mb-3 text-sm font-bold text-[#152862]">Admin Actions</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button type="button" disabled={saving} onClick={() => setConfirmStatus("Approved")} className="flex cursor-pointer items-center justify-center gap-1 rounded-md bg-green-700 px-2 py-3 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"><FiCheck size={16}/> Approve</button>
                  <button type="button" disabled={saving} onClick={() => setConfirmStatus("Rejected")} className="flex cursor-pointer items-center justify-center gap-1 rounded-md bg-red-600 px-2 py-3 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"><FiX size={16}/> Reject</button>
                  <button type="button" disabled={saving} onClick={() => updateReport("Needs Info")} className="flex cursor-pointer items-center justify-center gap-1 rounded-md border border-[#b3c3db] px-2 py-3 text-xs font-semibold text-[#152862] hover:bg-[#eaf1f7] disabled:opacity-50"><FiMessageCircle size={16}/> Request More Info</button>
                  <button type="button" disabled={saving || getStatus(selectedReport.status) !== "Approved"} title="Approve the report before marking it resolved" onClick={() => setConfirmStatus("Resolved")} className="flex cursor-pointer items-center justify-center gap-1 rounded-md border border-[#b3c3db] px-2 py-3 text-xs font-semibold text-[#152862] hover:bg-[#eaf1f7] disabled:cursor-not-allowed disabled:opacity-50"><FiCheck size={16}/> Mark Resolved</button>
                </div>
                {confirmStatus && <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900"><span>Mark report {selectedReport.id} as {confirmStatus.toLowerCase()}?</span><div className="flex gap-2"><button type="button" onClick={() => setConfirmStatus("")} className="rounded-md border border-gray-300 px-3 py-1.5">Cancel</button><button type="button" disabled={saving} onClick={() => updateReport(confirmStatus)} className="rounded-md bg-[#152862] px-3 py-1.5 text-white disabled:opacity-50">{saving ? "Saving..." : "Confirm"}</button></div></div>}
              </div>

              {/* notify student */}
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-bold text-[#152862]">Notify Student</h3>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message to notify the student..." aria-label="Notification message" className="min-w-0 flex-1 resize-y rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#2650aa]"/>
                  <button type="button" disabled={!message.trim() || sending} onClick={sendNotification} className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#152862] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#233e83] disabled:cursor-not-allowed disabled:opacity-50"><FiSend/> {sending ? "Sending..." : "Send Notification"}</button>
                </div>
                {notice && <p role="status" className="mt-2 text-sm text-green-700">{notice}</p>}
                {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
