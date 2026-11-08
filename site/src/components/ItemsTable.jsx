import { FiImage, FiTrash2 } from "react-icons/fi";
import ImageCarousel from "./ImageCarousel";

export default function ItemsTable({
  claims = [],
  statuses = {},
  onView,
  onRemove,
}) {
  return (
    <div className="overflow-x-auto px-5">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="bg-[#eaf1f7]">
          <tr>
            {["Item", "Claim ID", "Submitted", "Status", "Actions"].map(
              (heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-4 py-3 font-semibold"
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {claims.map((claim) => {
            const status = statuses[claim.status] ?? {
              label: claim.status || "Unknown",
              color: "bg-gray-100 text-gray-600",
            };

            return (
              <tr key={claim.claimId} className="hover:bg-blue-50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <ImageCarousel
                      images={claim.images?.length ? claim.images : [claim.image]}
                      alt={claim.itemName}
                      className="w-12"
                      imageClassName="h-12 w-12 rounded-lg bg-gray-100"
                      fallback={<FiImage size={22} className="text-gray-400" />}
                    />

                    <div>
                      <p className="font-semibold">{claim.itemName}</p>
                      <p className="mt-1 max-w-xs text-xs text-gray-500">
                        {claim.description}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">{claim.claimId}</td>

                <td className="whitespace-nowrap px-4 py-4 text-gray-500">
                  {claim.submitted}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${status.color}`}
                  >
                    {status.label}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => onView(claim)}
                      className="whitespace-nowrap rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold hover:bg-blue-100"
                    >
                      View details
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemove(claim)}
                      aria-label={`Remove claim ${claim.claimId}`}
                      className="flex items-center gap-2 text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 size={16} />
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}