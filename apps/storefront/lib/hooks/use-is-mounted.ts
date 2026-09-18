import { useSyncExternalStore } from "react"

function subscribe() {
  return () => {}
}

// True only after client-side hydration — false during SSR (Client
// Components still render once on the server) and on the first client
// render, matching what the server sent. Needed by anything that touches
// browser-only globals (document, window) conditionally, like a portal
// that might mount already-open.
//
// Implemented via useSyncExternalStore rather than a `useEffect(() =>
// setMounted(true), [])`, since that pattern trips the
// react-hooks/set-state-in-effect lint rule — this store never actually
// changes after mount, so there's nothing to subscribe to, but the
// getServerSnapshot/getSnapshot split is exactly what distinguishes the
// server-rendered value from the post-hydration one.
export function useIsMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
