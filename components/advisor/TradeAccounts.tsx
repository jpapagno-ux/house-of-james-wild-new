import { byCategory, type TradeAccount } from "@/lib/platform/trade-accounts";
import { Empty, Notice, Panel, StatusPill } from "@/components/platform/ui";

// Trade accounts, drawn the same on the Advisor Desk and the house desk. The supplier's agent address
// is text, not a link (no outbound links, CLAUDE.md); the vault link is the house's own password manager.

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="grid sm:grid-cols-[150px_1fr] gap-1 sm:gap-5 py-2.5">
      <dt className="text-[13px] ledger-muted">{label}</dt>
      <dd className="text-[15px] whitespace-pre-wrap break-words">{children}</dd>
    </div>
  );
}

function Card({ a, house }: { a: TradeAccount; house: boolean }) {
  return (
    <Panel className="flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h3 className="ledger-display text-[1.45rem] leading-tight">{a.supplier}</h3>
          {a.brands && <p className="text-[13px] ledger-muted mt-0.5">{a.brands}</p>}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <StatusPill label={a.loginType} tone={a.loginType === "To confirm" ? "attention" : "neutral"} />
          {!a.confirmed && <StatusPill label="Details being confirmed" tone="attention" />}
          {house && <StatusPill label={a.openTo} tone={a.openTo === "All advisors" ? "good" : "neutral"} />}
        </div>
      </div>
      <dl className="mt-3 divide-y divide-ink/10 border-y ledger-border">
        <Line label="Agent site">{a.portal && <span className="font-mono text-[13.5px] select-all">{a.portal}</span>}</Line>
        <Line label="Book under">{a.bookUnder || "Ask James for the house agency ID"}</Line>
        <Line label="How to get access">{a.access}</Line>
        <Line label="What you earn">{a.commissionNote}</Line>
        <Line label="Booking notes">{a.bookingNotes}</Line>
        <Line label="Support">{a.support}</Line>
      </dl>
      {a.vaultUrl && <p className="mt-4"><a href={a.vaultUrl} rel="noopener noreferrer nofollow" target="_blank" className="ledger-btn-ghost uppercase">Open the login in the vault</a></p>}
    </Panel>
  );
}

export default function TradeAccounts({ accounts, house = false }: { accounts: TradeAccount[]; house?: boolean }) {
  if (!accounts.length) {
    return <div className="mt-8"><Empty title={house ? "No trade accounts are showing yet" : "No trade accounts have been opened to you yet"}>{house ? "Tick Show on Desk on a row in the Trade Accounts table to list it here." : "Ask James if you need one."}</Empty></div>;
  }
  return (
    <>
      <div className="mt-6"><Notice>No passwords are kept on the desk. Where a supplier allows it, register your own login under the house agency ID. A shared house login, where one exists, opens from the password vault.</Notice></div>
      {byCategory(accounts).map(([category, list]) => (
        <section key={category} className="mt-10" aria-label={category}>
          <h2 className="ledger-eyebrow border-b ledger-border pb-2">{category}</h2>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">{list.map((a) => <Card key={a.id} a={a} house={house} />)}</div>
        </section>
      ))}
    </>
  );
}
