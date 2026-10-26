// The host card switchboard. Every stay, camp and reserve page shows the
// "Meet your host" card (components/record/HostPanel.tsx); this is where
// each one is switched. The library has no host_connect field and no host
// Person records linked yet, so every record defaults to "not_linking" (the
// house takes the call). Set "available" with a host once a partner approves
// host calls, or "off" to hide the card.
import type { Host, HostConnect } from "@/components/record/HostPanel";

export const HOSTS: Record<string, { state: HostConnect; host?: Host }> = {
  // "stay:leeu-estates": { state: "available", host: { name: "…", role: "…", topics: […], calendlyUrl: "…" } },
};

export const hostFor = (key: string) => HOSTS[key] ?? { state: "not_linking" as HostConnect };

// Films on file (Stay.brand_video_link) or supplied by James. Everything else
// gets the placeholder slot.
export const VIDEOS: Record<string, { id: string; title: string }> = {
  "stay:leeu-estates": { id: "rLbbxGMH9C8", title: "Leeu Estates, Franschhoek" },
  "stay:monwana-thornybush": { id: "YR_8uiBObZ4", title: "Monwana, Thornybush" },
};
