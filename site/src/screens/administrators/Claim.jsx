import { useEffect, useRef, useState } from "react";
import {
  FiUser,
  FiInbox,
  FiImage,
  FiUsers,
  FiCheck,
  FiX,
  FiSend,
  FiMessageCircle,
  FiChevronRight,
  FiPaperclip,
  FiRefreshCcw,
  FiInfo,
} from "react-icons/fi";
import { SlCalender } from "react-icons/sl";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaRegCheckCircle, FaRegClock } from "react-icons/fa";

// stats card
const StatCard = ({
  icon: Icon,
  iconColor = "#2650aa",
  iconBgColor = "#eaf1f7",
  number = 0,
  text = "",
}) => {
  return (
    <div className="flex items-center gap-4 rounded-md bg-white px-4 py-3 shadow-md">
      <div
        className="rounded-full p-2.5"
        style={{ backgroundColor: iconBgColor }}
      >
        <Icon size={28} color={iconColor} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[#152862]">{number}</h2>
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
};

const emptyClaims = [];
const emptyItems = [];

const getStatus = (status) => {
  const value = String(status ?? "Pending")
    .trim()
    .toLowerCase();
  const names = {
    pending: "Pending",
    "pending review": "Pending",
    "in review": "In Review",
    "needs info": "Needs Info",
    "needs student action": "Needs Info",
    approved: "Approved",
    rejected: "Rejected",
    resolved: "Resolved",
    returned: "Resolved",
  };
  return names[value] ?? String(status ?? "Pending");
};

const getDate = (date) => {
  if (!date) return "Not provided";
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? String(date)
    : value.toLocaleString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const getPhotos = (record) => {
  if (!record) return [];
  const photos =
    record.photos ??
    record.images ??
    (record.image
      ? [record.image]
      : record.imageUrl
        ? [record.imageUrl]
        : record.thumbnailUrl
          ? [record.thumbnailUrl]
          : []);
  return (Array.isArray(photos) ? photos : [photos])
    .map((photo) => (typeof photo === "string" ? photo : photo?.url))
    .filter(Boolean);
};

// item id must be shared by claims for the same found item
const getItemId = (claim) =>
  String(
    claim.itemId ?? claim.foundItemId ?? claim.item?.id ?? `claim:${claim.id}`,
  );

const statusColors = {
  Pending: "bg-amber-100 text-amber-800",
  "In Review": "bg-blue-100 text-blue-700",
  "Needs Info": "bg-red-100 text-red-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Resolved: "bg-emerald-100 text-emerald-700",
};

const StatusBadge = ({ status }) => {
  const value = getStatus(status);
  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusColors[value] ?? "bg-gray-100 text-gray-700"}`}
    >
      {value}
    </span>
  );
};

const getEvidence = (claim) => {
  const details = claim.identifyingDetails ?? claim.evidenceDetails ?? [];
  if (Array.isArray(details) && details.length)
    return details.map((detail) =>
      typeof detail === "string" ? { text: detail } : detail,
    );
  const description = claim.lostDescription ?? claim.description ?? "";
  return description ? [{ text: description }] : [];
};

export default function AdminClaim({
  claims = emptyClaims,
  items = emptyItems,
  onLoadClaimsForItem,
  onProcessClaim,
  onSendNotification,
  adminName = "Admin",
}) {
  const [claimList, setClaimList] = useState(claims);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [message, setMessage] = useState("");
  const [collectionConfirmed, setCollectionConfirmed] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [loadedItemIds, setLoadedItemIds] = useState({});
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const tabsRef = useRef(null);
  const tabRefs = useRef({});

  useEffect(() => {
    setClaimList(claims);
    setLoadedItemIds({});
  }, [claims]);

  // organize claims by found item
  const groups = new Map();

  items.forEach((item) => {
    const id = String(item.id);
    if (
      (item.claimCount ?? 0) > 0 ||
      claimList.some((claim) => getItemId(claim) === id)
    ) {
      groups.set(id, { id, item, claims: [] });
    }
  });

  claimList.forEach((claim) => {
    const id = getItemId(claim);
    if (!groups.has(id))
      groups.set(id, { id, item: claim.item ?? {}, claims: [] });
    groups.get(id).claims.push(claim);
  });

  const itemGroups = Array.from(groups.values());
  const getItemStatus = (group) => {
    const statuses = group.claims.map((claim) => getStatus(claim.status));
    return (
      [
        "Pending",
        "In Review",
        "Needs Info",
        "Approved",
        "Resolved",
        "Rejected",
      ].find((status) => statuses.includes(status)) ??
      (group.item.claimStatus
        ? getStatus(group.item.claimStatus)
        : "Not Loaded")
    );
  };

  const totalClaims = itemGroups.reduce(
    (total, group) =>
      total + Math.max(group.claims.length, group.item.claimCount ?? 0),
    0,
  );
  const pendingClaims = claimList.filter(
    (claim) => getStatus(claim.status) === "Pending",
  ).length;
  const approvedClaims = claimList.filter((claim) =>
    ["Approved", "Resolved"].includes(getStatus(claim.status)),
  ).length;
  const multiClaimItems = itemGroups.filter(
    (group) => Math.max(group.claims.length, group.item.claimCount ?? 0) > 1,
  ).length;
  const categories = [
    ...new Set(
      itemGroups
        .map((group) => group.item.category ?? group.claims[0]?.category)
        .filter(Boolean),
    ),
  ];

  const tabs = [
    "All",
    "Pending",
    "In Review",
    "Needs Info",
    "Approved",
    "Rejected",
    "Resolved",
  ].map((name) => ({
    name,
    count:
      name === "All"
        ? totalClaims
        : claimList.filter((claim) => getStatus(claim.status) === name).length,
  }));

  // filter items
  const filteredItems = itemGroups
    .filter((group) => {
      const query = search.trim().toLowerCase();
      const item = group.item;
      const category = item.category ?? group.claims[0]?.category ?? "";
      const name =
        item.itemName ?? item.name ?? group.claims[0]?.itemName ?? "";
      const matchesSearch = [
        group.id,
        name,
        category,
        item.location,
        item.foundLocation,
        ...group.claims.flatMap((claim) => [
          claim.id,
          claim.studentNumber,
          claim.itemName,
        ]),
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
      const matchesTab =
        activeTab === "All" ||
        group.claims.some((claim) => getStatus(claim.status) === activeTab);
      const matchesStatus =
        selectedStatus === "All" ||
        group.claims.some(
          (claim) => getStatus(claim.status) === selectedStatus,
        );
      const matchesCategory =
        selectedCategory === "All" || category === selectedCategory;
      return matchesSearch && matchesTab && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      const dateA =
        new Date(
          a.item.dateFound ?? a.item.createdAt ?? a.claims[0]?.createdAt ?? 0,
        ).getTime() || 0;
      const dateB =
        new Date(
          b.item.dateFound ?? b.item.createdAt ?? b.claims[0]?.createdAt ?? 0,
        ).getTime() || 0;
      return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
    });

  const selectedItem =
    itemGroups.find((group) => group.id === selectedItemId) ??
    itemGroups[0] ??
    null;
  const activeItemId = selectedItem?.id ?? null;
  const selectedClaim =
    selectedItem?.claims.find((claim) => claim.id === selectedClaimId) ??
    selectedItem?.claims[0] ??
    null;
  const selectedItemInfo = selectedItem?.item ?? {};
  const itemName =
    selectedItemInfo.itemName ??
    selectedItemInfo.name ??
    selectedItem?.claims[0]?.itemName ??
    "Unnamed item";
  const itemPhotos = getPhotos(selectedItemInfo).length
    ? getPhotos(selectedItemInfo)
    : getPhotos(selectedItem?.claims[0]?.item);
  const itemLocation =
    selectedItemInfo.foundLocation ??
    selectedItemInfo.location ??
    "Not provided";
  const today = new Date().toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // pull all claims for selected item
  useEffect(() => {
    if (!activeItemId || !onLoadClaimsForItem) return;
    let cancelled = false;
    setLoadingClaims(true);
    setLoadError("");
    Promise.resolve()
      .then(() => onLoadClaimsForItem(activeItemId))
      .then((result) => {
        if (cancelled) return;
        if (!Array.isArray(result))
          throw new Error("Expected a list of claims for this item.");
        const updated = result.map((claim) => ({
          ...claim,
          itemId: claim.itemId ?? activeItemId,
        }));
        if (updated.some((claim) => getItemId(claim) !== activeItemId))
          throw new Error("Some claims belong to another item.");
        setClaimList((current) => [
          ...current.filter((claim) => getItemId(claim) !== activeItemId),
          ...updated,
        ]);
        setLoadedItemIds((current) => ({ ...current, [activeItemId]: true }));
      })
      .catch((err) => {
        if (!cancelled)
          setLoadError(
            err?.message ?? "Could not load all claims for this item.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoadingClaims(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeItemId, onLoadClaimsForItem, claims, refreshKey]);

  useEffect(() => {
    setAdminNotes(selectedClaim?.adminNotes ?? "");
    setMessage("");
    setCollectionConfirmed(false);
    setConfirmStatus("");
    setNotice("");
    setError("");
  }, [selectedClaim?.id]);

  // scroll to active tab
  useEffect(() => {
    const container = tabsRef.current;
    const button = tabRefs.current[activeTab];
    if (!container || !button) return;
    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    container.scrollTo({
      left:
        container.scrollLeft +
        buttonRect.left -
        containerRect.left -
        (container.clientWidth - buttonRect.width) / 2,
      behavior: "smooth",
    });
  }, [activeTab]);

  const chooseItem = (group) => {
    if (saving || sending) return;
    setSelectedItemId(group.id);
    setSelectedClaimId(null);
    setError("");
    setNotice("");
  };
  const clearFilters = () => {
    setActiveTab("All");
    setSearch("");
    setSelectedStatus("All");
    setSelectedCategory("All");
    setSortOrder("Newest");
  };
  const canProcess =
    Boolean(selectedClaim) &&
    !saving &&
    !sending &&
    !loadingClaims &&
    (!onLoadClaimsForItem || (loadedItemIds[activeItemId] && !loadError));
  const hasApprovedOther = selectedItem?.claims.some(
    (claim) =>
      claim.id !== selectedClaim?.id &&
      ["Approved", "Resolved"].includes(getStatus(claim.status)),
  );

  // process claim
  const processClaim = async (status) => {
    if (!canProcess) return;
    const currentStatus = getStatus(selectedClaim.status);
    if (["Rejected", "Resolved"].includes(currentStatus)) return;
    if (currentStatus === "Approved" && status !== "Resolved") return;
    if (
      status === "Approved" &&
      (currentStatus === "Approved" || hasApprovedOther)
    ) {
      setError(
        "This item already has an approved claim, or the selected claim is approved.",
      );
      return;
    }
    if (status === "Rejected" && !adminNotes.trim()) {
      setError("Please add a reason before rejecting this claim.");
      return;
    }
    if (status === "Needs Info" && !message.trim()) {
      setError(
        "Type a message explaining what information the student needs to provide.",
      );
      return;
    }
    if (status === "Needs Info" && !onSendNotification) {
      setError(
        "Connect onSendNotification to request information from a student.",
      );
      return;
    }
    if (
      status === "Resolved" &&
      (currentStatus !== "Approved" || !collectionConfirmed)
    ) {
      setError(
        "Confirm collection of an approved claim before marking the item returned.",
      );
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    const claimId = selectedClaim.id;
    const details = {
      status,
      adminNotes: adminNotes.trim(),
      itemId: activeItemId,
      ...(status === "Resolved"
        ? { collectedAt: new Date().toISOString() }
        : {}),
    };

    try {
      if (onProcessClaim) await onProcessClaim(claimId, details);
      setClaimList((current) =>
        current.map((claim) =>
          claim.id === claimId
            ? {
                ...claim,
                ...details,
                activity: [
                  {
                    title:
                      status === "Resolved"
                        ? "Item returned to student"
                        : `Claim marked ${status.toLowerCase()}`,
                    date: new Date().toISOString(),
                  },
                  ...(claim.activity ?? []),
                ],
              }
            : claim,
        ),
      );
      setConfirmStatus("");
      setCollectionConfirmed(false);
      setNotice(
        onProcessClaim
          ? "Claim updated successfully."
          : "Claim updated locally. Connect onProcessClaim to save it.",
      );

      if (status === "Needs Info") {
        try {
          await onSendNotification(claimId, {
            studentNumber: selectedClaim.studentNumber,
            itemId: activeItemId,
            message: message.trim(),
          });
          setMessage("");
          setNotice(
            onProcessClaim
              ? "Information requested and notification sent."
              : "Notification sent. Claim status was changed locally only.",
          );
        } catch (err) {
          setNotice("");
          setError(
            `Claim status changed, but the notification failed: ${err?.message ?? "Please try sending it separately."}`,
          );
        }
      }
    } catch (err) {
      setError(err?.message ?? "Could not update this claim.");
    } finally {
      setSaving(false);
    }
  };

  // notify student
  const sendNotification = async () => {
    if (!selectedClaim || !message.trim() || sending) return;
    if (!onSendNotification) {
      setError("Connect onSendNotification to send student messages.");
      return;
    }
    setSending(true);
    setError("");
    setNotice("");
    try {
      await onSendNotification(selectedClaim.id, {
        studentNumber: selectedClaim.studentNumber,
        itemId: activeItemId,
        message: message.trim(),
      });
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
          <h1 className="text-2xl font-bold text-[#152862] md:text-3xl">
            Process Student Claims
          </h1>
          <p className="mt-1 text-sm text-gray-600 md:text-base">
            Review and compare ownership claims submitted by students for found
            items.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* date card */}
          <div className="flex items-center gap-2 rounded-md bg-[#516f88]/20 px-3 py-2">
            <SlCalender size={18} />
            <p className="text-sm font-semibold text-gray-600">{today}</p>
          </div>
          {/* user icon */}
          <div className="flex items-center gap-2 rounded-md bg-[#516f88]/20 px-3 py-2">
            <FiUser size={20} />
            <p className="hidden text-sm font-semibold text-gray-600 sm:block">
              Logged in as Administrator
            </p>
          </div>
        </div>
      </div>

      {/* info */}
      <div className="mt-4 flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-[#2650aa]">
        <FiInfo size={18} className="mt-0.5 shrink-0" />
        <p>
          Compare all claims for the same item and check the evidence before
          approving ownership.
        </p>
      </div>

      {/* quick stats */}
      <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={IoDocumentTextOutline}
          number={totalClaims}
          text="Total Claims"
        />
        <StatCard
          icon={FaRegClock}
          iconColor="#663300"
          iconBgColor="#fff0d9"
          number={pendingClaims}
          text="Pending Review"
        />
        <StatCard
          icon={FiUsers}
          number={multiClaimItems}
          text="Multi-Claim Items"
        />
        <StatCard
          icon={FaRegCheckCircle}
          iconColor="#01461c"
          iconBgColor="#e4f4ea"
          number={approvedClaims}
          text="Approved / Returned"
        />
      </div>

      {/* body */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[0.95fr_1.15fr]">
        {/* claims queue */}
        <section className="min-w-0 rounded-lg bg-white p-4 shadow-md md:p-5">
          <h2 className="text-xl font-bold text-[#152862]">Claims Queue</h2>

          {/* tabs */}
          <div
            ref={tabsRef}
            className="mt-4 flex gap-2 overflow-x-auto border-b border-gray-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((tab) => (
              <button
                key={tab.name}
                ref={(el) => {
                  tabRefs.current[tab.name] = el;
                }}
                type="button"
                onClick={() => setActiveTab(tab.name)}
                className={`shrink-0 cursor-pointer border-b-[3px] px-3 pb-2 text-sm font-semibold transition-colors ${activeTab === tab.name ? "border-[#dba621] text-[#152862]" : "border-transparent text-gray-500 hover:text-[#152862]"}`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </div>

          {/* search and filters */}
          <div className="my-4 flex flex-wrap gap-2">
            {/* search */}
            <div className="flex min-w-48 flex-1 items-center gap-2 rounded-md border border-gray-300 px-3 py-2.5 focus-within:border-[#2650aa]">
              <FaMagnifyingGlass size={15} className="shrink-0 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search claim ID, student number, item..."
                aria-label="Search claims"
                className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            {/* status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by status"
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-2.5 text-sm text-gray-700 outline-none"
            >
              <option value="All">All statuses</option>
              {tabs.slice(1).map((tab) => (
                <option key={tab.name} value={tab.name}>
                  {tab.name}
                </option>
              ))}
            </select>
            {/* category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by item category"
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-2.5 text-sm text-gray-700 outline-none"
            >
              <option value="All">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {/* date */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              aria-label="Sort items"
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-2.5 text-sm text-gray-700 outline-none"
            >
              <option value="Newest">Date (Newest)</option>
              <option value="Oldest">Date (Oldest)</option>
            </select>
            <button
              type="button"
              onClick={clearFilters}
              className="cursor-pointer rounded-md bg-[#eaf1f7] px-3 py-2.5 text-sm font-medium text-[#152862] hover:bg-gray-200"
            >
              Clear
            </button>
          </div>

          {/* item list */}
          <div className="flex flex-col gap-2">
            {filteredItems.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-4 text-center">
                <div className="mb-3 rounded-full bg-[#eaf1f7] p-4">
                  <FiInbox size={32} className="text-[#2650aa]" />
                </div>
                <h3 className="font-semibold text-[#152862]">
                  {itemGroups.length === 0
                    ? "No claims yet"
                    : "No matching items"}
                </h3>
                <p className="mt-2 max-w-xs text-sm text-gray-500">
                  {itemGroups.length === 0
                    ? "Items with student ownership claims will appear here."
                    : "Try another search or clear your filters."}
                </p>
              </div>
            ) : (
              filteredItems.map((group) => {
                const item = group.item;
                const name =
                  item.itemName ??
                  item.name ??
                  group.claims[0]?.itemName ??
                  "Unnamed item";
                const photos = getPhotos(item).length
                  ? getPhotos(item)
                  : getPhotos(group.claims[0]?.item);
                const count = Math.max(
                  group.claims.length,
                  item.claimCount ?? 0,
                );
                return (
                  <div
                    key={group.id}
                    className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 transition-colors ${selectedItem?.id === group.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#eaf1f7]">
                      {photos[0] ? (
                        <img
                          src={photos[0]}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FiImage size={25} className="text-[#2650aa]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#152862]">{name}</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Item {group.id} ·{" "}
                        {item.foundLocation ??
                          item.location ??
                          "Location not provided"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {getDate(item.dateFound ?? item.createdAt)} ·{" "}
                        {item.category ??
                          group.claims[0]?.category ??
                          "Uncategorised"}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <StatusBadge status={getItemStatus(group)} />
                      <p className="flex items-center gap-1 text-xs font-semibold text-[#2650aa]">
                        <FiUsers /> {count} {count === 1 ? "claim" : "claims"}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={saving || sending}
                      onClick={() => chooseItem(group)}
                      className="flex cursor-pointer items-center gap-1 rounded-md bg-[#152862] px-3 py-2 text-xs font-semibold text-white hover:bg-[#233e83] disabled:opacity-40"
                    >
                      Compare <FiChevronRight />
                    </button>
                  </div>
                );
              })
            )}
          </div>
          <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
            Showing {filteredItems.length} of {itemGroups.length} items with
            claims
          </p>
        </section>

        {/* claim comparison */}
        <section className="min-w-0 rounded-lg bg-white p-4 shadow-md md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-[#152862]">
              Claim Comparison
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {selectedItem && (
                <span className="rounded-full bg-[#eaf1f7] px-3 py-1 text-xs font-semibold text-[#2650aa]">
                  {loadingClaims
                    ? "Loading claims..."
                    : onLoadClaimsForItem
                      ? loadedItemIds[activeItemId]
                        ? `${selectedItem.claims.length} claims loaded for this item`
                        : "Claims not fully loaded"
                      : `${selectedItem.claims.length} supplied claims`}
                </span>
              )}
              {selectedItem && onLoadClaimsForItem && (
                <button
                  type="button"
                  disabled={loadingClaims}
                  onClick={() => setRefreshKey((value) => value + 1)}
                  title="Refresh all claims for this item"
                  aria-label="Refresh claims"
                  className="rounded-md bg-[#eaf1f7] p-2 text-[#152862] disabled:opacity-40"
                >
                  <FiRefreshCcw size={15} />
                </button>
              )}
            </div>
          </div>

          {!selectedItem ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 rounded-full bg-[#eaf1f7] p-4">
                <FiUsers size={32} className="text-[#2650aa]" />
              </div>
              <h3 className="font-semibold text-[#152862]">No item selected</h3>
              <p className="mt-2 text-sm text-gray-500">
                Select an item to compare all student claims for it.
              </p>
            </div>
          ) : (
            <>
              {/* item details */}
              <div className="mt-4 flex flex-col gap-4 rounded-md border border-gray-200 p-3 sm:flex-row">
                <div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#eaf1f7] sm:w-32">
                  {itemPhotos[0] ? (
                    <img
                      src={itemPhotos[0]}
                      alt={itemName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiImage size={40} className="text-[#2650aa]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-[#152862]">
                      {itemName}
                    </h3>
                    <StatusBadge status={getItemStatus(selectedItem)} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Item ID</p>
                      <p className="font-medium text-[#152862]">
                        {activeItemId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-medium text-[#152862]">
                        {selectedItemInfo.category ?? "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Found Location</p>
                      <p className="font-medium text-[#152862]">
                        {itemLocation}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date Found</p>
                      <p className="font-medium text-[#152862]">
                        {getDate(
                          selectedItemInfo.dateFound ??
                            selectedItemInfo.createdAt,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-[#152862]">
                      Description
                    </p>
                    <p className="mt-1 text-sm leading-5 text-gray-600">
                      {selectedItemInfo.description ??
                        "No item description provided."}
                    </p>
                  </div>
                  {[
                    "brand",
                    "color",
                    "material",
                    "uniqueMarkings",
                    "condition",
                  ].some((field) => selectedItemInfo[field]) && (
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-200 pt-3">
                      {[
                        "brand",
                        "color",
                        "material",
                        "uniqueMarkings",
                        "condition",
                      ]
                        .filter((field) => selectedItemInfo[field])
                        .map((field) => (
                          <div key={field}>
                            <p className="text-xs capitalize text-gray-500">
                              {field === "uniqueMarkings"
                                ? "Unique Markings"
                                : field}
                            </p>
                            <p className="text-xs font-medium text-[#152862]">
                              {selectedItemInfo[field]}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* item photos */}
              {itemPhotos.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {itemPhotos.map((photo, index) => (
                    <a
                      key={`${photo}-${index}`}
                      href={photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-16 w-16 overflow-hidden rounded-md border border-gray-200"
                    >
                      <img
                        src={photo}
                        alt={`Item photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}

              {/* all claims for item */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-4">
                <h3 className="text-base font-bold text-[#152862]">
                  Claims for this item ({selectedItem.claims.length})
                </h3>
                {onLoadClaimsForItem && (
                  <span className="text-xs text-gray-500">
                    {loadingClaims
                      ? "Checking all claims..."
                      : loadedItemIds[activeItemId] && !loadError
                        ? "All claims fetched"
                        : "Use refresh to retry loading"}
                  </span>
                )}
              </div>
              {loadError && (
                <p
                  role="alert"
                  className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700"
                >
                  {loadError}
                </p>
              )}
              {loadingClaims ? (
                <p className="my-8 text-center text-sm text-gray-500">
                  Loading students' claims...
                </p>
              ) : selectedItem.claims.length === 0 ? (
                <p className="my-8 text-center text-sm text-gray-500">
                  No claims have been loaded for this item yet.
                </p>
              ) : (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-3">
                  {selectedItem.claims.map((claim) => {
                    const evidence = getEvidence(claim);
                    const proof = Array.isArray(claim.proof) ? claim.proof : [];
                    const isSelected = selectedClaim?.id === claim.id;
                    return (
                      <button
                        key={claim.id}
                        type="button"
                        disabled={saving || sending}
                        onClick={() => setSelectedClaimId(claim.id)}
                        aria-pressed={isSelected}
                        className={`w-56 shrink-0 cursor-pointer rounded-md border p-3 text-left transition-colors sm:w-64 ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300"}`}
                      >
                        {claim.recommended === true && (
                          <p className="mb-2 rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                            Suggested match · review evidence
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="rounded-full bg-[#eaf1f7] p-2">
                              <FiUser size={18} className="text-[#2650aa]" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[#152862]">
                                {claim.studentName ??
                                  `Student ${claim.studentNumber ?? "Unknown"}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                #{claim.studentNumber ?? "Not supplied"}
                              </p>
                            </div>
                          </div>
                          {claim.confidence && (
                            <span className="rounded-md bg-[#eaf1f7] px-2 py-1 text-xs font-semibold text-[#2650aa]">
                              {claim.confidence}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <p className="text-xs text-gray-500">
                            Claim {claim.id}
                          </p>
                          <StatusBadge status={claim.status} />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {getDate(
                            claim.claimedAt ??
                              claim.createdAt ??
                              claim.lostDate,
                          )}
                        </p>
                        <p className="mt-3 text-xs font-bold text-[#152862]">
                          Identifying Details
                        </p>
                        {evidence.length ? (
                          <div className="mt-2 space-y-2">
                            {evidence.map((detail, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 text-xs text-gray-600"
                              >
                                <span
                                  className={
                                    detail.matches === true
                                      ? "text-green-600"
                                      : detail.matches === false
                                        ? "text-red-500"
                                        : "text-gray-400"
                                  }
                                >
                                  {detail.matches === true ? (
                                    <FiCheck size={14} />
                                  ) : detail.matches === false ? (
                                    <FiX size={14} />
                                  ) : (
                                    "•"
                                  )}
                                </span>
                                <span className="break-words">
                                  {detail.text ??
                                    detail.description ??
                                    "Details provided"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-gray-500">
                            No identifying details provided.
                          </p>
                        )}
                        <p className="mt-3 text-xs font-bold text-[#152862]">
                          Proof Provided
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {proof.map((entry, index) => (
                            <span
                              key={index}
                              className="rounded-md bg-[#eaf1f7] px-2 py-1 text-xs text-[#2650aa]"
                            >
                              {typeof entry === "string"
                                ? entry
                                : (entry.label ?? entry.type ?? "Evidence")}
                            </span>
                          ))}
                          {claim.attachmentUrl && (
                            <span className="rounded-md bg-green-50 px-2 py-1 text-xs text-green-700">
                              Attachment
                            </span>
                          )}
                          {claim.receiptUrl && (
                            <span className="rounded-md bg-green-50 px-2 py-1 text-xs text-green-700">
                              Receipt
                            </span>
                          )}
                          {getPhotos(claim).length > 0 && (
                            <span className="rounded-md bg-green-50 px-2 py-1 text-xs text-green-700">
                              {getPhotos(claim).length} photo(s)
                            </span>
                          )}
                          {!proof.length &&
                            !claim.attachmentUrl &&
                            !claim.receiptUrl &&
                            !getPhotos(claim).length && (
                              <span className="text-xs text-gray-500">
                                No proof attached
                              </span>
                            )}
                        </div>
                        {getPhotos(claim).length > 0 && (
                          <div className="mt-2 flex gap-1.5">
                            {getPhotos(claim)
                              .slice(0, 3)
                              .map((photo, index) => (
                                <img
                                  key={`${photo}-${index}`}
                                  src={photo}
                                  alt={`Evidence ${index + 1}`}
                                  className="h-12 w-12 rounded-md object-cover"
                                />
                              ))}
                          </div>
                        )}
                        {claim.adminNotes && (
                          <div className="mt-3">
                            <p className="text-xs font-bold text-[#152862]">
                              Admin Notes
                            </p>
                            <p className="mt-1 line-clamp-3 text-xs italic text-gray-600">
                              {claim.adminNotes}
                            </p>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* selected claim */}
              {selectedClaim && (
                <div className="mt-3 rounded-md bg-[#eaf1f7]/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#152862]">
                      Selected Claim: {selectedClaim.id}
                    </h3>
                    <StatusBadge status={selectedClaim.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-[#152862]">
                        Student:{" "}
                      </span>
                      {selectedClaim.studentNumber ?? "Not supplied"}
                    </p>
                    <p>
                      <span className="font-semibold text-[#152862]">
                        Lost Location:{" "}
                      </span>
                      {selectedClaim.lostLocation ?? "Not supplied"}
                    </p>
                    <p>
                      <span className="font-semibold text-[#152862]">
                        Date Lost:{" "}
                      </span>
                      {getDate(selectedClaim.lostDate)}
                    </p>
                    <p>
                      <span className="font-semibold text-[#152862]">
                        Collection:{" "}
                      </span>
                      {selectedClaim.collection ??
                        selectedClaim.receiveMethod ??
                        "Not supplied"}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4">
                    {selectedClaim.attachmentUrl && (
                      <a
                        href={selectedClaim.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#2650aa] underline"
                      >
                        <FiPaperclip /> View student attachment
                      </a>
                    )}
                    {selectedClaim.receiptUrl && (
                      <a
                        href={selectedClaim.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#2650aa] underline"
                      >
                        <FiPaperclip /> View receipt
                      </a>
                    )}
                  </div>
                  <div className="mt-3">
                    <label
                      htmlFor="claim-notes"
                      className="text-sm font-bold text-[#152862]"
                    >
                      Admin Notes
                    </label>
                    <textarea
                      id="claim-notes"
                      rows={2}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add your review notes or rejection reason..."
                      className="mt-2 w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2650aa]"
                    />
                  </div>
                </div>
              )}

              {/* admin actions */}
              {selectedClaim && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h3 className="mb-3 text-sm font-bold text-[#152862]">
                    Admin Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                      type="button"
                      disabled={
                        !canProcess ||
                        ["Approved", "Rejected", "Resolved"].includes(
                          getStatus(selectedClaim.status),
                        ) ||
                        hasApprovedOther
                      }
                      onClick={() => setConfirmStatus("Approved")}
                      className="flex cursor-pointer items-center justify-center gap-1 rounded-md bg-green-700 px-2 py-3 text-xs font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <FiCheck size={15} /> Approve
                    </button>
                    <button
                      type="button"
                      disabled={
                        !canProcess ||
                        ["Rejected", "Resolved", "Approved"].includes(
                          getStatus(selectedClaim.status),
                        )
                      }
                      onClick={() => setConfirmStatus("Rejected")}
                      className="flex cursor-pointer items-center justify-center gap-1 rounded-md bg-red-600 px-2 py-3 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <FiX size={15} /> Reject
                    </button>
                    <button
                      type="button"
                      disabled={
                        !canProcess ||
                        ["Approved", "Rejected", "Resolved"].includes(
                          getStatus(selectedClaim.status),
                        )
                      }
                      onClick={() => processClaim("Needs Info")}
                      className="flex cursor-pointer items-center justify-center gap-1 rounded-md border border-[#b3c3db] px-2 py-3 text-xs font-semibold text-[#152862] hover:bg-[#eaf1f7] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <FiMessageCircle size={15} /> Request Info
                    </button>
                    <button
                      type="button"
                      disabled={
                        !canProcess ||
                        getStatus(selectedClaim.status) !== "Approved"
                      }
                      onClick={() => setConfirmStatus("Resolved")}
                      className="flex cursor-pointer items-center justify-center gap-1 rounded-md border border-[#b3c3db] px-2 py-3 text-xs font-semibold text-[#152862] hover:bg-[#eaf1f7] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <FiCheck size={15} /> Mark Returned
                    </button>
                  </div>
                  {getStatus(selectedClaim.status) === "Approved" && (
                    <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={collectionConfirmed}
                        onChange={(e) =>
                          setCollectionConfirmed(e.target.checked)
                        }
                        className="mt-0.5"
                      />{" "}
                      I have verified the student's identity and confirmed the
                      item was collected.
                    </label>
                  )}
                  {hasApprovedOther && (
                    <p className="mt-3 text-xs text-amber-700">
                      Another claim is already approved for this item. Review it
                      before approving a different student.
                    </p>
                  )}
                  {confirmStatus && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                      <span>
                        Mark claim {selectedClaim.id} as{" "}
                        {confirmStatus === "Resolved"
                          ? "returned"
                          : confirmStatus.toLowerCase()}
                        ?
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmStatus("")}
                          className="rounded-md border border-gray-300 px-3 py-1.5"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => processClaim(confirmStatus)}
                          className="rounded-md bg-[#152862] px-3 py-1.5 text-white disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Confirm"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* notify student */}
              {selectedClaim && (
                <div className="mt-4">
                  <h3 className="mb-2 text-sm font-bold text-[#152862]">
                    Notify Student #{selectedClaim.studentNumber ?? "Unknown"}
                  </h3>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message to notify the selected student..."
                      aria-label="Student notification"
                      className="min-w-0 flex-1 resize-y rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#2650aa]"
                    />
                    <button
                      type="button"
                      disabled={
                        !message.trim() || sending || saving || loadingClaims
                      }
                      onClick={sendNotification}
                      className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#152862] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#233e83] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <FiSend /> {sending ? "Sending..." : "Send Notification"}
                    </button>
                  </div>
                </div>
              )}

              {/* activity */}
              {selectedClaim && (
                <div className="mt-4 rounded-md bg-[#eaf1f7]/70 p-3">
                  <h3 className="mb-3 text-sm font-bold text-[#152862]">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {(selectedClaim.activity?.length
                      ? selectedClaim.activity
                      : [
                          {
                            title: "Claim submitted by student",
                            date:
                              selectedClaim.claimedAt ??
                              selectedClaim.createdAt,
                          },
                        ]
                    ).map((entry, index) => (
                      <div key={entry.id ?? index} className="flex gap-2">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#dba621]" />
                        <div>
                          <p className="text-sm text-[#152862]">
                            {entry.title ?? entry.message ?? "Claim updated"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {getDate(entry.date ?? entry.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notice && (
                <p role="status" className="mt-3 text-sm text-green-700">
                  {notice}
                </p>
              )}
              {error && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                  {error}
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
