"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client.js";

/** Fetch JSON from our API with loading/error state and a reload() helper. Pass null to skip. */
export function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: !!url, error: null });
  const load = useCallback(async () => {
    if (!url) return setState({ data: null, loading: false, error: null });
    setState((s) => ({ ...s, loading: true, error: null }));
    try { setState({ data: await api(url), loading: false, error: null }); }
    catch (e) { setState({ data: null, loading: false, error: e.message }); }
  }, [url]);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}
