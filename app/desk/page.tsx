import Link from "next/link";
import { notFound } from "next/navigation";
import { PARTNER_DESK } from "@/lib/platform/flags";
import { FLAGS } from "@/lib/booking-live/flags";

// /desk: the two doors of the house desk. Each door checks its own role.
export default function DeskIndex() {
  const doors = [
    ...(FLAGS.quotes ? [{ href: "/desk/bookings", title: "Bookings", line: "Requests to reserve, holds, bookings and payments." }] : []),
    ...(PARTNER_DESK ? [{ href: "/desk/review", title: "Partner review", line: "Submissions and proposed changes from partners." }] : []),
  ];
  if (!doors.length) notFound();
  return (
    <div className="max-w-2xl">
      <p className="ledger-eyebrow ledger-crimson">House desk</p>
      <h1 className="ledger-display text-[2rem] md:text-[2.6rem] leading-[1.1]">The desk</h1>
      <ul className="mt-8 border-y ledger-border">
        {doors.map((d) => (
          <li key={d.href} className="border-b ledger-border last:border-b-0">
            <Link href={d.href} className="block py-5 group">
              <span className="ledger-display text-[1.4rem] group-hover:underline">{d.title}</span>
              <span className="block text-[15px] ledger-muted mt-1">{d.line}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
