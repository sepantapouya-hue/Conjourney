import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { getIdentity } from "../lib/presence";

const PUBLIC_KEY = import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY;
export const presenceEnabled = Boolean(PUBLIC_KEY);
export const ROOM_ID = "conjourney-main";

export default function PresenceProvider({ children }) {
  if (!presenceEnabled) return children;
  const user = getIdentity();
  return (
    <LiveblocksProvider publicApiKey={PUBLIC_KEY} throttle={80}>
      <RoomProvider
        id={ROOM_ID}
        initialPresence={{
          cursor: null,
          user,
          viewId: null,
          viewName: "",
          mode: "select",
        }}
      >
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  );
}
