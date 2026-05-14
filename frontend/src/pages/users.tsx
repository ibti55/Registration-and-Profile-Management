export default function Users() {
  return (
    <main className="flex-1 space-y-4 px-2 py-4">
      <section>
        <h2 className="text-lg font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground">
          Manage BPSC users and permissions.
        </p>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-4">
          {[
            { name: "Abdur Rafi", email: "rafi@bpsc.gov.bd", role: "Admin" },
            { name: "John Doe", email: "john@bpsc.gov.bd", role: "Editor" },
            { name: "Jane Smith", email: "jane@bpsc.gov.bd", role: "Viewer" },
          ].map((user) => (
            <div
              key={user.email}
              className="flex items-center justify-between rounded-lg border bg-background px-4 py-3"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <span className="text-xs font-medium text-primary">{user.role}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
