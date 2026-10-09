import { useState } from "react";
import { FiUser } from "react-icons/fi";
import { CiLogout } from "react-icons/ci";

const demoData = [
  {
    "id": "C001",
    "studentNumber": "4429119",
    "itemName": "Samsung phone",
    "status": "Pending",
    "lostDate": "2026-10-08",
    "lostLocation": "Student Centre",
    "lostDescription": "Black case with a scratch near the camera.",
    "receiveMethod": "Pick up at the office",
    "collection": "CPS Office",
    "contactNumber": "Not supplied",
    "attachmentUrl": null
  },
  {
    "id": "C002",
    "studentNumber": "4346572",
    "itemName": "Black backpack",
    "status": "Pending",
    "lostDate": "2026-10-07",
    "lostLocation": "Main Library",
    "lostDescription": "Black backpack with a red keyring.",
    "receiveMethod": "Pick up at the office",
    "collection": "CPS Office",
    "contactNumber": "Not supplied",
    "attachmentUrl": null
  }
];
const inputClass = "box-border w-full min-w-0 rounded-lg border border-gray-300 bg-white p-2 focus:border-[#152862] focus:outline-none focus:ring-2 focus:ring-[#152862]/30";
const statusColours = {
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-red-100 text-red-800",
};

// The shared app layout supplies the navbar. This component supplies only the screen.
// Pass initialData and onProcess for backend use; omitted props enable a demo.
export default function AdminClaim({ initialData = demoData, onProcess, adminName = "Admin", onLogout }) {
  const [records, setRecords] = useState(() => initialData.map(record => ({ ...record })));
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("Pending");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = records.find(record => record.id === selectedId);
  const query = search.trim().toLowerCase();
  const visible = records.filter(record =>
    (filter === "All" || record.status === filter) &&
    [record.id, record.studentNumber, record.itemName].some(value => String(value).toLowerCase().includes(query))
  );

  function review(record) {
    setSelectedId(record.id);
    setNotes(record.adminNotes || "");
    setMessage("");
    setError("");
  }

  function changeFilter(value) {
    setFilter(value);
    setSelectedId(null);
    setNotes("");
    setMessage("");
    setError("");
  }

  async function processDecision(status) {
    if (!selected || selected.status !== "Pending" || busy) return;
    if (status === "Rejected" && !notes.trim()) {
      setError("Please add a reason before rejecting this claim.");
      return;
    }
    const id = selected.id;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      // The callback must reject/throw if the server fails. Update only after success.
      if (onProcess) await onProcess(id, status, notes.trim());
      setRecords(current => current.map(record => record.id === id
        ? { ...record, status, adminNotes: notes.trim() }
        : record));
      setMessage(onProcess
        ? `Claim ${id} ${status.toLowerCase()} successfully.`
        : `Demo: claim ${id} ${status.toLowerCase()}. No server data was changed.`);
    } catch {
      setError("The decision could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#eaf1f7] p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#152862] md:text-2xl">Process Student Claims</h1>
          <p className="mt-1 text-sm text-gray-600">Review ownership evidence and process student claims.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 items-center gap-2 rounded-full bg-[#152862]/10 px-3 py-2 font-semibold text-[#152862]">
            <FiUser className="shrink-0 text-[#cead5e]" size={22} />
            <span className="truncate text-sm">Logged in as: <strong className="text-black">{adminName}</strong></span>
          </div>
          {onLogout && <button type="button" aria-label="Log out" onClick={onLogout} disabled={busy} className="rounded-full p-1 hover:bg-red-50"><CiLogout size={26} color="#f14c53" /></button>}
        </div>
      </div>
      {!onProcess && <p className="mt-4 rounded-lg border border-[#cead5e] bg-white p-3 text-sm text-[#152862]">Demo mode: sample submissions only. Decisions reset when this screen reloads.</p>}
      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
        <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-lg md:p-6 lg:col-span-3" aria-labelledby="claim-list-title">
          <h2 id="claim-list-title" className="text-xl font-bold text-[#152862]">Student Claims</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-[140px_1fr]">
            <div><label htmlFor="claim-filter" className="mb-1 block text-sm">Status</label>
              <select id="claim-filter" className={inputClass} value={filter} disabled={busy} onChange={e => changeFilter(e.target.value)}>
                {["All", "Pending", "Approved", "Rejected"].map(status => <option key={status}>{status}</option>)}
              </select>
            </div>
            <div><label htmlFor="claim-search" className="mb-1 block text-sm">Search</label>
              <input id="claim-search" type="search" className={inputClass} placeholder="Search ID, student number or item..." value={search} disabled={busy} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {visible.length === 0 && <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">No claims match your search or status filter.</p>}
            {visible.map(record => <article key={record.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${selectedId === record.id ? "border-[#152862] bg-[#152862]/5" : "border-gray-200"}`}>
              <div className="min-w-0 flex-1">
                <h3 className="break-words font-semibold text-[#152862]">{record.itemName}</h3>
                <p className="mt-1 text-sm text-gray-600">{record.id} · Student {record.studentNumber}</p>
                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColours[record.status]}`}>{record.status}</span>
              </div>
              <button type="button" disabled={busy} aria-pressed={selectedId === record.id} onClick={() => review(record)} className="rounded-lg bg-[#152862] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">{record.status === "Pending" ? "Review" : "View"}</button>
            </article>)}
          </div>
        </section>
        <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-md md:p-6 lg:col-span-2" aria-labelledby="claim-review-title">
          <h2 id="claim-review-title" className="text-xl font-bold text-[#152862]">{selected ? `Review Claim — ${selected.id}` : "Claim Details"}</h2>
          {!selected ? <p className="mt-4 text-sm text-gray-500">Click Review beside a claim to see its details and process it.</p> : <>
            <dl className="mt-5 space-y-3 text-sm">
              <div><dt className="font-semibold text-[#152862]">Student number</dt><dd className="mt-1 whitespace-pre-wrap break-words text-gray-700">{selected.studentNumber || "Not supplied"}</dd></div>
              <div><dt className="font-semibold text-[#152862]">Item</dt><dd className="mt-1 whitespace-pre-wrap break-words text-gray-700">{selected.itemName || "Not supplied"}</dd></div>
              <div><dt className="font-semibold text-[#152862]">Status</dt><dd className="mt-1 whitespace-pre-wrap break-words text-gray-700">{selected.status || "Not supplied"}</dd></div>
              <div><dt className="font-semibold text-[#152862]">Date lost</dt><dd className="mt-1 whitespace-pre-wrap break-words text-gray-700">{selected.lostDate || "Not supplied"}</dd></div>
              <div><dt className="font-semibold text-[#152862]">Location lost</dt><dd className="mt-1 whitespace-pre-wrap break-words text-gray-700">{selected.lostLocation || "Not supplied"}</dd></div>
              <div><dt className="font-semibold text-[#152862]">Ownership description</dt><dd className="mt-1 whitespace-pre-wrap break-words text-gray-700">{selected.lostDescription || "Not supplied"}</dd></div>
              <div><dt className="font-semibold text-[#152862]">Receive method</dt><dd className="mt-1 whitespace-pre-wrap break-words text-gray-700">{selected.receiveMethod || "Not supplied"}</dd></div>
              <div><dt className="font-semibold text-[#152862]">Collection point</dt><dd className="mt-1 whitespace-pre-wrap break-words text-gray-700">{selected.collection || "Not supplied"}</dd></div>
              <div><dt className="font-semibold text-[#152862]">Contact number</dt><dd className="mt-1 whitespace-pre-wrap break-words text-gray-700">{selected.contactNumber || "Not supplied"}</dd></div>
            </dl>
            {selected.attachmentUrl ? <a href={selected.attachmentUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-emerald-700 underline">View attachment</a> : <p className="mt-4 text-sm text-gray-500">No attachment provided.</p>}
            <div className="mt-5">
              <label htmlFor="claim-notes" className="mb-2 block text-sm font-semibold">Admin notes {selected.status === "Pending" && "(required when rejecting)"}</label>
              <textarea id="claim-notes" className={`${inputClass} h-28 resize-y`} value={notes} disabled={busy || selected.status !== "Pending"} onChange={e => { setNotes(e.target.value); setError(""); }} placeholder="Add your review notes or rejection reason..." />
            </div>
            {selected.status === "Pending" ? <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" disabled={busy} onClick={() => processDecision("Approved")} className="flex-1 rounded-lg bg-[#cead5e] px-4 py-2 font-semibold text-[#152862] hover:opacity-90 disabled:opacity-50">{busy ? "Saving..." : "Approve Claim"}</button>
              <button type="button" disabled={busy} onClick={() => processDecision("Rejected")} className="flex-1 rounded-lg border border-red-500 px-4 py-2 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Reject Claim</button>
            </div> : <p className="mt-4 text-sm font-semibold text-[#152862]">This claim has been {selected.status.toLowerCase()}.</p>}
          </>}
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
        </section>
      </div>
    </div>
  );
}
