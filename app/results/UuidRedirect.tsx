"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const KEY = "relive-oddball:user-uuid";

// If the user lands on /results without ?u=, try to recover the uuid from
// localStorage and replace the URL. If still nothing, do nothing — the page
// already renders an empty-state CTA.
export function UuidRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const uuid = window.localStorage.getItem(KEY);
    if (uuid && /^[0-9a-f-]{36}$/i.test(uuid)) {
      router.replace(`/results?u=${uuid}`);
    }
  }, [router]);
  return null;
}
