export default function Settings() {
  return (
    <main className="flex-1 space-y-4 px-2 py-4">
      <section>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure application settings and preferences.
        </p>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">General Settings</h3>
            <p className="text-sm text-muted-foreground">
              Application configuration options will appear here.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
