import { permanentRedirect } from "next/navigation";

// The Tswalu preview went live on the reserve page (approved by James, 30 Oct 2026).
export default function TswaluPreview() {
  permanentRedirect("/safaris/tswalu-reserve#rates");
}
