import {
  BarChart3,
  FileText,
  Home,
  Bell,
  LifeBuoy,
  Settings,
  User,
  ScrollText,
  ClipboardList,
  CreditCard,
} from "lucide-react"

export const MAIN_NAV = [
  { title: "Dashboard", icon: Home, href: "/dashboard", isActive: true, i18nKey: "nav.dashboard" },
  { title: "My Profile", icon: User, href: "/profile", i18nKey: "nav.profile" },
  { title: "Circulars", icon: ScrollText, href: "/circulars", i18nKey: "nav.circulars" },
  { title: "My Applications", icon: ClipboardList, href: "/applications", i18nKey: "nav.applications" },
  { title: "Payments", icon: CreditCard, href: "/payments", i18nKey: "nav.payments" },
  { title: "Notifications", icon: Bell, href: "/notifications", i18nKey: "nav.notifications" },
]

export const REPORT_LINKS = [
  { title: "Application History", href: "/applications", i18nKey: "application.title" },
  { title: "Payment History", href: "/payments", i18nKey: "payment.title" },
]

export const FOOTER_NAV = [
  { title: "Support", icon: LifeBuoy, href: "#", i18nKey: "nav.support" },
  { title: "Settings", icon: Settings, href: "/settings", i18nKey: "nav.settings" },
]
