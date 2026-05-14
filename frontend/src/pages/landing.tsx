const highlights = [
  {
    title: "Smart recruitment workflows",
    description:
      "Design and publish position requirements with automated review checkpoints and audit trails.",
  },
  {
    title: "Citizen-centric communications",
    description:
      "Keep applicants informed with consistent updates, SMS-ready templates, and multilingual support.",
  },
  {
    title: "Secure, compliant data",
    description:
      "Role-based access and archival policies aligned with public sector governance.",
  },
]

const metrics = [
  { label: "Applications processed", value: "1.8M+" },
  { label: "Active review boards", value: "420" },
  { label: "Average response time", value: "4.2 days" },
  { label: "Nationwide service points", value: "64" },
]

const testimonials = [
  {
    name: "Director of Operations",
    role: "Recruitment Division",
    quote:
      "The platform brings clarity to every step, from committee reviews to final decisions.",
  },
  {
    name: "Regional Coordinator",
    role: "Field Administration",
    quote:
      "Our teams collaborate faster and keep candidates informed without losing transparency.",
  },
  {
    name: "Policy Analyst",
    role: "Strategic Planning",
    quote:
      "A structured view of performance data helps us plan future recruitment cycles.",
  },
]

const faqs = [
  {
    question: "How does BPSC ensure transparency?",
    answer:
      "Every decision step is logged with responsible officers and timestamps, giving full visibility.",
  },
  {
    question: "Can the system support multiple recruitment drives?",
    answer:
      "Yes. Each campaign can be configured independently with tailored scoring and workflows.",
  },
  {
    question: "Is the platform accessible to citizens?",
    answer:
      "The applicant portal is designed for accessibility, multilingual support, and mobile access.",
  },
]

export default function Landing() {
  return (
    <main className="flex-1 bg-background">
      <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-10 md:px-10">
        <section className="grid gap-8 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/10 p-10 shadow-sm md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border/40">
              Bangladesh Public Service Commission
            </span>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                A unified digital gateway for transparent public service recruitment
              </h1>
              <p className="text-base text-muted-foreground">
                Deliver consistent, citizen-first hiring experiences with secure workflows,
                real-time analytics, and nationwide collaboration.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow">
                Start a recruitment cycle
              </button>
              <button className="rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-foreground">
                Explore citizen portal
              </button>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Trusted by national departments
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                99.9% workflow uptime
              </div>
            </div>
          </div>
          <div className="space-y-4 rounded-2xl bg-background/70 p-6 shadow-sm ring-1 ring-border/40 backdrop-blur-md">
            <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-border/30 dark:bg-background/80">
              <p className="text-xs text-muted-foreground">Live queue</p>
              <p className="mt-2 text-2xl font-semibold">3,214 candidates</p>
              <p className="mt-1 text-xs text-emerald-600">+12% this week</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-border/30 dark:bg-background/80">
              <p className="text-xs text-muted-foreground">Committee readiness</p>
              <p className="mt-2 text-2xl font-semibold">87%</p>
              <p className="mt-1 text-xs text-muted-foreground">
                On-track for monthly evaluation
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-border/30 dark:bg-background/80">
              <p className="text-xs text-muted-foreground">Notifications delivered</p>
              <p className="mt-2 text-2xl font-semibold">46,580</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Multichannel delivery success
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-background/80 p-6 shadow-sm ring-1 ring-border/30 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl bg-muted/30 p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold">Impact at a glance</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Performance indicators for nationwide recruitment operations.
              </p>
            </div>
            <button className="rounded-full border border-border/60 px-5 py-2 text-sm font-semibold">
              Download quarterly brief
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl bg-background/80 p-5 shadow-sm ring-1 ring-border/30"
              >
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="mt-3 text-xl font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl bg-background/80 p-8 shadow-sm ring-1 ring-border/30">
            <h2 className="text-2xl font-semibold">Designed for every stakeholder</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              From applicants to oversight committees, every journey is streamlined
              with clear next steps and secure data handling.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              {[
                "Applicant status tracking and automated messaging",
                "Committee scheduling with cross-team visibility",
                "Policy dashboards for executive leadership",
                "Field-office readiness and compliance reporting",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-muted/30 p-8">
            <div className="grid gap-4">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="rounded-2xl bg-background/80 p-5 shadow-sm ring-1 ring-border/30"
                >
                  <p className="text-sm text-muted-foreground">“{testimonial.quote}”</p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-muted/30 p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Everything you need to know about the BPSC recruitment ecosystem.
              </p>
            </div>
            <button className="rounded-full border border-border/60 px-5 py-2 text-sm font-semibold">
              View policy library
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl bg-background/80 p-5 shadow-sm ring-1 ring-border/30"
              >
                <p className="text-sm font-semibold">{faq.question}</p>
                <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold">Ready to launch the next drive?</h2>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Activate a new recruitment cycle with guided planning and automated oversight.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-background px-5 py-2 text-sm font-semibold text-foreground">
                Request onboarding
              </button>
              <button className="rounded-full border border-primary-foreground/40 px-5 py-2 text-sm font-semibold text-primary-foreground">
                Contact support
              </button>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <span>© 2026 Bangladesh Public Service Commission</span>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Accessibility</span>
            <span>Help Center</span>
          </div>
        </footer>
      </div>
    </main>
  )
}
