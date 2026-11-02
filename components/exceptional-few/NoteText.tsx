import Link from "next/link";

// James' note, with "ask me" (when it closes the note) made the enquiry itself. Approved by James, 1 Nov 2026.
export default function NoteText({ text, href, className = "" }: { text: string; href: string; className?: string }) {
  const m = /^(.*?)(ask me)([.!]?)$/is.exec(text.trim());
  return (
    <p className={className}>
      &ldquo;{m ? <>{m[1]}<Link href={href} className="underline underline-offset-[6px] decoration-1 hover:opacity-80">{m[2]}</Link>{m[3]}</> : text}&rdquo;
    </p>
  );
}
