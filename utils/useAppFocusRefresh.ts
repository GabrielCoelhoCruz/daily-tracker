import { useEffect, useState } from "react";
import { AppState } from "react-native";

/**
 * Returns a counter that increments when the app returns to the foreground.
 * Use as a dependency in useMemo/useEffect to recompute stale date values.
 */
export function useAppFocusRefresh(): number {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setRefreshKey((k) => k + 1);
      }
    });
    return () => sub.remove();
  }, []);

  return refreshKey;
}
