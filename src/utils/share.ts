import type { Adventure } from "../types/index";

export function buildShareUrl(adventure: Adventure): string {
  const encoded = btoa(
    unescape(encodeURIComponent(JSON.stringify(adventure)))
  );
  return `${window.location.origin}${window.location.pathname}?adventure=${encoded}`;
}
