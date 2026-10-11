import { useState } from "react";
import {
  FiInbox,
  FiSearch,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";
import ItemsTable from "../../components/ItemsTable";

const initialClaims = [
  {
    claimId: "C001",
    itemName: "Samsung phone",
    description: "Black Samsung Galaxy smartphone",
    submitted: "08 Oct 2026",
    status: "pending",
  },
  {
    claimId: "C002",
    itemName: "Black backpack",
    description: "Black nylon backpack with a front pocket",
    submitted: "07 Oct 2026",
    status: "approved",
  },
  {
    claimId: "C003",
    itemName: "Silver keys",
    description: "Three keys with a blue keyring",
    submitted: "01 Oct 2026",
    status: "rejected",
  },
];

const statuses = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700",
  },
  approved: {
    label: "Approved",
    color: "bg-blue-100 text-blue-700",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700",
  },
};

function StatCard({ icon: Icon, number, label, color }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
      <div className={`rounded-full p-3 ${color}`}>
        <Icon size={25} />
      </div>

      <div>
        <p className="text-3xl font-bold text-[#152862]">{number}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function Claims({ onNewClaim }) {
  const [claims, setClaims] = useState(initialClaims);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedClaim, setSelectedClaim] = useState(null);

  const activeCount = claims.filter(
    (claim) => claim.status === "pending" || claim.status === "approved"
  ).length;

  const historyCount = claims.filter(
    (claim) => claim.status === "rejected"
  ).length;

  const approvedCount = claims.filter(
    (claim) => claim.status === "approved"
  ).length;

  const tabs = [
    { name: "All", count: claims.length },
    { name: "Active", count: activeCount },
    { name: "History", count: historyCount },
  ];

  const filteredClaims = claims.filter((claim) => {
    const query = search.trim().toLowerCase();

    const matchesSearch = [
      claim.itemName,
      claim.claimId,
      claim.description,
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(query)
    );

    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Active" &&
        ["pending", "approved"].includes(claim.status)) ||
      (activeTab === "History" && claim.status === "rejected");

    const matchesStatus =
      selectedStatus === "All" || claim.status === selectedStatus;

    return matchesSearch && matchesTab && matchesStatus;
  });

  function removeClaim(claim) {
    if (!window.confirm(`Remove your claim for ${claim.itemName}?`)) {
      return;
    }

    setClaims((current) =>
      current.filter((item) => item.claimId !== claim.claimId)
    );

    if (selectedClaim?.claimId === claim.claimId) {
      setSelectedClaim(null);
    }
  }

  function clearFilters() {
    setSearch("");
    setActiveTab("All");
    setSelectedStatus("All");
  }

  function handleNewClaim() {
    if (onNewClaim) {
      onNewClaim();
    } else {
      window.alert("Connect this button to your claim form.");
    }
  }

  return (
    <main className="min-h-screen bg-[#eaf1f7] p-4 text-[#152862] md:p-8">
      <div className="mx-auto">
        {/* Heading */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Claims</h1>
            <p className="mt-2 text-sm text-gray-500">
              Track your claims and reclaim what belongs to you.
            </p>
          </div>

          <button
            type="button"
            onClick={handleNewClaim}
            className="flex items-center gap-2 rounded-lg bg-[#152862] px-5 py-3 text-sm font-semibold text-white hover:bg-[#233e83]"
          >
            <FiPlus size={20} />
            Make a claim
          </button>
        </header>

        {/* Statistics */}
        <div className="my-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={FiFileText}
            number={activeCount}
            label="Active claims"
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            icon={FiClock}
            number={historyCount}
            label="Historical claims"
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={FiCheckCircle}
            number={approvedCount}
            label="Approved claims"
            color="bg-green-50 text-green-600"
          />
        </div>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 px-4 sm:gap-5">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                type="button"
                onClick={() => setActiveTab(tab.name)}
                aria-pressed={activeTab === tab.name}
                className={`border-b-4 px-3 py-4 text-sm font-semibold ${
                  activeTab === tab.name
                    ? "border-[#dba621] text-[#152862]"
                    : "border-transparent text-gray-500 hover:text-[#152862]"
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search and status filter */}
          <div className="flex flex-col gap-3 p-5 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-lg border border-gray-300 px-3 focus-within:border-blue-600">
              <FiSearch size={19} className="shrink-0 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by item name or claim ID..."
                aria-label="Search claims"
                className="w-full min-w-0 bg-transparent py-3 text-sm outline-none"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              aria-label="Filter claims by status"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm sm:w-48"
            >
              <option value="All">All statuses</option>

              {Object.entries(statuses).map(([value, status]) => (
                <option key={value} value={value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reusable table component */}
          <ItemsTable
            claims={filteredClaims}
            statuses={statuses}
            onView={setSelectedClaim}
            onRemove={removeClaim}
          />

          {/* Empty state */}
          {filteredClaims.length === 0 && (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <FiInbox size={42} className="mb-3 text-blue-400" />

              <h2 className="font-semibold">
                {claims.length === 0 ? "No claims yet" : "No matching claims"}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {claims.length === 0
                  ? "Make a claim for a found item that belongs to you."
                  : "Try a different search or clear your filters."}
              </p>

              {claims.length > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Footer */}
          <p className="mx-5 border-t border-gray-100 py-4 text-xs text-gray-500">
            Showing {filteredClaims.length} of {claims.length} claims
          </p>
        </section>

        {/* Selected claim details */}
        {selectedClaim && (
          <section
            aria-label="Claim details"
            className="mt-5 rounded-xl bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Claim details</h2>

              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <h3 className="mt-4 font-semibold">{selectedClaim.itemName}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedClaim.description}
            </p>

            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-gray-500">Claim ID</dt>
                <dd className="mt-1 font-medium">{selectedClaim.claimId}</dd>
              </div>

              <div>
                <dt className="text-gray-500">Submitted</dt>
                <dd className="mt-1 font-medium">{selectedClaim.submitted}</dd>
              </div>

              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="mt-1 font-medium">
                  {statuses[selectedClaim.status]?.label ??
                    selectedClaim.status}
                </dd>
              </div>
            </dl>
          </section>
        )}
      </div>
    </main>
  );
}