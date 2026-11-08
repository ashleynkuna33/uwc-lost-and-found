import { useEffect, useMemo, useState } from "react";
import {
  FiInbox,
  FiSearch,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiFileText,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { CiLogout } from "react-icons/ci";
import ItemsTable from "../../components/ItemsTable";
import CreateClaim from "../../components/CreateClaim";
import { claimsApi } from "../../api/modules/claims.api";
import { itemApi } from "../../api/modules/items.api";

const statuses = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", color: "bg-blue-100 text-blue-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
};

const formatDate = (value) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getErrorMessage = (error, fallback) => {
  const message = error?.response?.data?.message || error?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
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

export default function Claims({ onNewClaim, user, logout }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemsWarning, setItemsWarning] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [isCreatingClaim, setIsCreatingClaim] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadClaims() {
      setLoading(true);
      setError(null);
      setItemsWarning(false);

      try {
        // Claims are user-specific and require the JWT in apiClient.
        // Item details are a separate API because ClaimResponse has no item name.
        const [claimResult, itemResult] = await Promise.allSettled([
          claimsApi.getMine(),
          itemApi.getAll(),
        ]);

        if (claimResult.status === "rejected") {
          throw claimResult.reason;
        }

        const rawClaims = claimResult.value.data;
        if (!Array.isArray(rawClaims)) {
          throw new Error("Unexpected response from the claims API.");
        }

        const items =
          itemResult.status === "fulfilled" &&
          Array.isArray(itemResult.value.data)
            ? itemResult.value.data
            : [];

        const itemById = new Map(
          items.map((item) => [String(item.id), item])
        );

        const mappedClaims = rawClaims.map((claim) => {
          const item = itemById.get(String(claim.itemId));
          return {
            ...claim,
            // Keep the actual database claimId and itemId.
            itemName: item?.itemName || `Item #${claim.itemId}`,
            images: item?.images || (item?.image ? [item.image] : []),
            description: item?.description || "Item details unavailable.",
            itemLocation: item?.location || null,
            submitted: formatDate(claim.createdAt),
            status: String(claim.status || "pending").toLowerCase(),
          };
        });

        if (!cancelled) {
          setAvailableItems(items);
          setClaims(mappedClaims);
          setItemsWarning(
            itemResult.status !== "fulfilled" || !Array.isArray(itemResult.value.data)
          );
          setSelectedClaim((current) =>
            current
              ? mappedClaims.find((c) => c.claimId === current.claimId) || null
              : null
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Unable to retrieve your claims."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadClaims();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const selectedClaimId = selectedClaim?.claimId;

  useEffect(() => {
    if (!selectedClaimId) {
      setEvidence([]);
      setEvidenceError(null);
      setEvidenceLoading(false);
      return;
    }

    let cancelled = false;
    setEvidence([]);
    setEvidenceLoading(true);
    setEvidenceError(null);

    claimsApi
      .getEvidence(selectedClaimId)
      .then((response) => {
        if (!cancelled) {
          setEvidence(Array.isArray(response.data) ? response.data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setEvidenceError(getErrorMessage(err, "Could not load evidence."));
        }
      })
      .finally(() => {
        if (!cancelled) setEvidenceLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedClaimId]);

  const activeCount = useMemo(
    () => claims.filter((c) => ["pending", "approved"].includes(c.status)).length,
    [claims]
  );
  const historyCount = useMemo(
    () => claims.filter((c) => c.status === "rejected").length,
    [claims]
  );
  const approvedCount = useMemo(
    () => claims.filter((c) => c.status === "approved").length,
    [claims]
  );

  const tabs = [
    { name: "All", count: claims.length },
    { name: "Active", count: activeCount },
    { name: "History", count: historyCount },
  ];

  const filteredClaims = useMemo(() => {
    const query = search.trim().toLowerCase();
    return claims
      .filter((claim) => {
        const matchesSearch = [
          claim.itemName,
          claim.claimId,
          claim.itemId,
          claim.description,
          claim.explanation,
        ].some((value) => String(value ?? "").toLowerCase().includes(query));

        const matchesTab =
          activeTab === "All" ||
          (activeTab === "Active" &&
            ["pending", "approved"].includes(claim.status)) ||
          (activeTab === "History" && claim.status === "rejected");

        const matchesStatus =
          selectedStatus === "All" || claim.status === selectedStatus;

        return matchesSearch && matchesTab && matchesStatus;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime() || 0;
        const timeB = new Date(b.createdAt).getTime() || 0;
        return timeB - timeA || Number(b.claimId) - Number(a.claimId);
      });
  }, [claims, search, activeTab, selectedStatus]);

  function clearFilters() {
    setSearch("");
    setActiveTab("All");
    setSelectedStatus("All");
  }

  function handleNewClaim() {
    onNewClaim?.();
    setIsCreatingClaim(true);
  }

  async function submitNewClaim({ itemId, proofOfOwnership }) {
    await claimsApi.submit(itemId, proofOfOwnership);
    setReloadKey((key) => key + 1);
  }

  function handleRemoveUnavailable() {
    // No DELETE /claims/{id} route exists in the provided backend.
    // Never pretend that deleting from local state deletes from the database.
    window.alert("Deleting claims is not supported by the backend yet.");
  }

  return (
    <main className="min-h-screen bg-[#eaf1f7] p-4 text-[#152862] md:p-8">
      <div className="mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#152862] md:text-3xl">
              My Claims
            </h1>
            <p className="mt-1 text-sm text-gray-600 md:text-base">
              Track your claims and reclaim what belongs to you.
            </p>
          </div>

          <div className="flex flex-row flex-wrap gap-4 items-center justify-center">
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              title="Refresh claims"
              aria-label="Refresh claims"
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white p-3 hover:bg-gray-50 disabled:opacity-50"
            >
              <FiRefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              type="button"
              onClick={handleNewClaim}
              className="flex items-center gap-2 rounded-lg bg-[#152862] px-5 py-3 text-sm font-semibold text-white hover:bg-[#233e83]"
            >
              <FiPlus size={20} />
              Make a claim
            </button>

            <div className="flex flex-row items-center gap-1.5">
              <div className="rounded-2xl px-1 py-1.5 text-sm font-bold text-blue-950">
                Logged in: {user?.studentNumber || "Student"}
              </div>
              <button
                type="button"
                title="Log out"
                aria-label="Log out"
                onClick={logout}
                className="cursor-pointer"
              >
                <CiLogout size={28} color="#a61d3d" />
              </button>
            </div>
          </div>
        </header>

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

          {itemsWarning && !loading && !error && (
            <p className="mx-5 mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Claims loaded, but item details could not be retrieved. Showing item IDs instead.
            </p>
          )}

          {loading ? (
            <div className="px-5 py-16 text-center text-sm text-gray-500" role="status">
              Loading your claims...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
              <FiAlertCircle size={35} className="text-red-500" />
              <p className="text-sm font-semibold text-red-700">
                Unable to load claims
              </p>
              <p className="text-sm text-gray-500">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="rounded-lg bg-[#152862] px-4 py-2 text-sm font-semibold text-white"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {filteredClaims.length > 0 && (
                <ItemsTable
                  claims={filteredClaims}
                  statuses={statuses}
                  onView={setSelectedClaim}
                  onRemove={handleRemoveUnavailable}
                />
              )}

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
            </>
          )}

          {!loading && !error && (
            <p className="mx-5 border-t border-gray-100 py-4 text-xs text-gray-500">
              Showing {filteredClaims.length} of {claims.length} claims
            </p>
          )}
        </section>

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
                <dd className="mt-1 font-medium">#{selectedClaim.claimId}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Item ID</dt>
                <dd className="mt-1 font-medium">#{selectedClaim.itemId}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Submitted</dt>
                <dd className="mt-1 font-medium">{selectedClaim.submitted}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="mt-1 font-medium">
                  {statuses[selectedClaim.status]?.label || selectedClaim.status}
                </dd>
              </div>
              {selectedClaim.reviewedAt && (
                <div>
                  <dt className="text-gray-500">Reviewed</dt>
                  <dd className="mt-1 font-medium">
                    {formatDate(selectedClaim.reviewedAt)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold">Your ownership explanation</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                {selectedClaim.explanation || "No explanation provided."}
              </p>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold">Evidence</p>
              {evidenceLoading ? (
                <p className="mt-2 text-sm text-gray-500">Loading evidence...</p>
              ) : evidenceError ? (
                <p className="mt-2 text-sm text-red-600">{evidenceError}</p>
              ) : evidence.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">No evidence submitted yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {evidence.map((entry) => (
                    <li key={entry.evidenceId} className="rounded-lg border border-gray-200 p-3 text-sm">
                      <p className="font-semibold">{entry.evidenceType}</p>
                      {entry.description && (
                        <p className="mt-1 whitespace-pre-wrap text-gray-600">
                          {entry.description}
                        </p>
                      )}
                      {entry.filePath && (
                        <p className="mt-1 text-gray-500">File reference: {entry.filePath}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </div>
      {isCreatingClaim && (
        <CreateClaim
          items={availableItems}
          hidden={() => setIsCreatingClaim(false)}
          onClaim={submitNewClaim}
        />
      )}
    </main>
  );
}
