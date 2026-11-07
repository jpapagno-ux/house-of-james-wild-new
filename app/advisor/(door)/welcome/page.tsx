import { redirect } from "next/navigation";

// Kept so earlier links still land: an invited advisor's place is their file.
export default function AdvisorWelcome() {
  redirect("/advisor/file");
}
