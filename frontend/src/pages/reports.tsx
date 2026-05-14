export default function Reports() {
  return (
    <main className="flex-1 space-y-4 px-2 py-4">
      <section>
        <h2 className="text-lg font-semibold">Reports</h2>
        <p className="text-sm text-muted-foreground">
          View and analyze BPSC operational reports.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[
          { title: "Monthly Report", link: "#" },
          { title: "Quarterly Report", link: "#" },
          { title: "Annual Report", link: "#" },
        ].map((report) => (
          <div
            key={report.title}
            className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <h3 className="font-semibold">{report.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Click to view detailed analysis and metrics.
            </p>
          </div>
        ))}
      </section>
    </main>
  )
}
