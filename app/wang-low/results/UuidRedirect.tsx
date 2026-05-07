"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const KEY = "relive-oddball:user-uuid";

// If the user lands on /wang-low/results without ?u=, recover the uuid from
// localStorage and replace the URL.
export function UuidRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const uuid = window.localStorage.getItem(KEY);
    if (uuid && /^[0-9a-f-]{36}$/i.test(uuid)) {
      router.replace(`/wang-low/results?u=${uuid}`);
    }
  }, [router]);
  return null;
}
