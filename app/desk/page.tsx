import { redirect } from "next/navigation";

// /desk on its own opens the house review queue (which asks the house to sign in on the Partner Desk page).
export default function HouseDesk() {
  redirect("/desk/review");
}
