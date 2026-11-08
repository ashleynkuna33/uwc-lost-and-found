
import { useEffect, useState } from "react";
import ItemsContainer from "../../components/ItemsContainer";
import { itemApi } from "../../api/modules/items.api";

function FindItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await itemApi.getAll();

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid items response from server.");
        }

        if (!cancelled) {
          setItems(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch items:", err);

          setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to load items."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refreshItems = () => {
    setReloadKey((previous) => previous + 1);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto bg-[#eaf1f7]">

      <div className="flex justify-center p-6 bg-[#152862] border-b-4 border-[#cead5e] shadow-md">
        <h1 className="font-bold text-white text-2xl tracking-wide">
          BROWSE LOST AND FOUND PROPERTY
        </h1>
      </div>

      <ItemsContainer
        items={items}
        loading={loading}
        error={error}
        onRetry={refreshItems}
      />

    </div>
  );
}

export default FindItems;
