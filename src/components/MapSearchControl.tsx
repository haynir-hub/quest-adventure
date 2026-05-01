import React, { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";

const RECENT_KEY = "quest_recent_searches";
const MAX_RECENT = 5;
const DEBOUNCE_MS = 500;

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface RecentSearch {
  name: string;
  lat: number;
  lng: number;
}

interface MapSearchControlProps {
  onSelect?: (lat: number, lng: number, displayName: string) => void;
  placeholder?: string;
}

const loadRecent = (): RecentSearch[] => {
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is RecentSearch =>
        r &&
        typeof r.name === "string" &&
        typeof r.lat === "number" &&
        typeof r.lng === "number",
    );
  } catch {
    return [];
  }
};

const saveRecent = (entry: RecentSearch) => {
  try {
    const current = loadRecent();
    const filtered = current.filter((r) => r.name !== entry.name);
    const next = [entry, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // localStorage full or blocked — silently ignore; not critical
  }
};

export const MapSearchControl: React.FC<MapSearchControlProps> = ({
  onSelect,
  placeholder = "חפש כתובת או מיקום בישראל...",
}) => {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<RecentSearch[]>(() => loadRecent());
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    debounceRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=5&accept-language=he&countrycodes=il`,
          { headers: { "Accept-Language": "he" }, signal: controller.signal },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: NominatimResult[] = await res.json();
        const safe = Array.isArray(data) ? data : [];
        setResults(safe);
        setError(safe.length === 0 ? "לא נמצאו תוצאות" : null);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError("שגיאת חיפוש");
        setResults([]);
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (lat: number, lng: number, name: string) => {
    map.flyTo([lat, lng], 17, { duration: 1.0 });
    saveRecent({ name, lat, lng });
    setRecent(loadRecent());
    setQuery("");
    setResults([]);
    setFocused(false);
    inputRef.current?.blur();
    onSelect?.(lat, lng, name);
  };

  const trimmedQuery = query.trim();
  const showRecentList =
    focused && trimmedQuery.length === 0 && recent.length > 0;
  const showResultsList =
    focused &&
    trimmedQuery.length >= 2 &&
    (results.length > 0 || error || loading);
  const showDropdown = showRecentList || showResultsList;

  return (
    <div
      className="absolute top-3 left-3 right-3 z-[500] max-w-md mx-auto"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 200)}
          placeholder={placeholder}
          className="w-full bg-white/95 backdrop-blur-sm rounded-xl pr-10 pl-10 py-3 text-slate-800 text-sm shadow-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {loading ? "⌛" : "🔍"}
        </span>
        {query && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setQuery("");
              setResults([]);
              setError(null);
              inputRef.current?.focus();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 w-6 h-6 flex items-center justify-center"
            aria-label="נקה"
          >
            ✕
          </button>
        )}
      </div>
      {showDropdown && (
        <div className="mt-1 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-[300px] overflow-y-auto">
          {showRecentList && (
            <>
              <div className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50">
                חיפושים אחרונים
              </div>
              {recent.map((r) => (
                <button
                  key={`recent-${r.name}-${r.lat}-${r.lng}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(r.lat, r.lng, r.name);
                  }}
                  className="w-full text-right px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 border-t border-slate-100 truncate"
                >
                  🕒 {r.name}
                </button>
              ))}
            </>
          )}
          {showResultsList && results.length > 0 && (
            <>
              {results.map((r) => (
                <button
                  key={`${r.lat}-${r.lon}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(
                      parseFloat(r.lat),
                      parseFloat(r.lon),
                      r.display_name,
                    );
                  }}
                  className="w-full text-right px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 border-t border-slate-100 truncate"
                  title={r.display_name}
                >
                  📍 {r.display_name}
                </button>
              ))}
            </>
          )}
          {showResultsList && error && !loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapSearchControl;
