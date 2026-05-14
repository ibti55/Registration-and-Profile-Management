export default function Documents() {
  return (
    <main className="flex-1 space-y-4 px-2 py-4">
      <section>
        <h2 className="text-lg font-semibold">Documents</h2>
        <p className="text-sm text-muted-foreground">
          Access and manage BPSC documents and files.
        </p>
      </section>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground">No documents available.</p>
      </div>
    </main>
  )
}
