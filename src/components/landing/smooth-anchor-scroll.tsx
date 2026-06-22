"use client";

import * as React from "react";

function stripHash() {
  const { pathname, search } = window.location;
  if (window.location.hash) {
    window.history.replaceState(null, "", pathname + search);
  }
}

export function SmoothAnchorScroll() {
  React.useEffect(() => {
    // Strip any hash that came in via direct navigation / refresh,
    // then scroll to the targeted section smoothly if it exists.
    if (window.location.hash) {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id) {
        const el = document.getElementById(id);
        if (el) {
          requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
      }
      stripHash();
    }

    // Keep the URL clean if the user uses browser back/forward
    // and lands on a hash that we no longer want in the address bar.
    const onPopState = () => stripHash();
    window.addEventListener("popstate", onPopState);

    // Capture phase so we run before Next.js Link calls router.push().
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;

      const id = decodeURIComponent(href.slice(1));
      const el = document.getElementById(id);
      if (!el) return;

      // Prevent the browser from jumping and stop Next.js Link from
      // pushing the hash into the URL.
      event.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      stripHash();
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return null;
}
