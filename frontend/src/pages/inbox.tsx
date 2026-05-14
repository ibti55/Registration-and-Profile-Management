export default function Inbox() {
  return (
    <main className="flex-1 space-y-4 px-2 py-4">
      <section>
        <h2 className="text-lg font-semibold">Inbox</h2>
        <p className="text-sm text-muted-foreground">
          Manage your messages and communications.
        </p>
      </section>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground">No messages yet.</p>
      </div>
    </main>
  )
}
