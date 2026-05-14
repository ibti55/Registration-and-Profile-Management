import { Outlet, useLocation, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronUp, LogOut, Settings, User2 } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { MAIN_NAV, REPORT_LINKS, FOOTER_NAV } from "@/config/nav-config"
import { useAuth } from "@/contexts/auth-context"

function SidebarFloatingTrigger() {
  const { state } = useSidebar()

  const left =
    state === "collapsed" ? "var(--sidebar-width-icon)" : "var(--sidebar-width)"

  return (
    <SidebarTrigger
      variant="outline"
      className="fixed top-4 z-40 hidden h-8 w-8 rounded-full bg-background shadow md:flex"
      style={{ left: `calc(${left} - 0.75rem)` }}
    />
  )
}

function AppSidebar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <img
            src="/src/assets/Government_Seal_of_Bangladesh.svg"
            alt="Government Seal of Bangladesh"
            className="size-8 rounded-full bg-white p-0.5"
          />
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">BPSC</span>
            <span className="text-xs text-muted-foreground">Registration & Profile</span>
          </div>
        </div>
        <SidebarInput
          placeholder={t('app.search')}
          className="group-data-[collapsible=icon]:hidden"
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            {t('nav.dashboard')}
          </SidebarGroupLabel>
          <SidebarMenu>
            {MAIN_NAV.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.href}
                  tooltip={t(item.i18nKey)}
                >
                  <Link to={item.href}>
                    <item.icon />
                    <span>{t(item.i18nKey)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[isActive=true]:bg-transparent"
              >
                <Link to="/applications" className="font-medium">
                  Analytics
                </Link>
              </SidebarMenuButton>
              <SidebarMenuSub>
                {REPORT_LINKS.map((link) => (
                  <SidebarMenuSubItem key={link.title}>
                    <SidebarMenuSubButton asChild>
                      <Link to={link.href}>{t(link.i18nKey)}</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {FOOTER_NAV.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={t(item.i18nKey)}>
                <Link to={item.href}>
                  <item.icon />
                  <span>{t(item.i18nKey)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    <User2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.applicant_name || user?.email?.split('@')[0] || 'Applicant'}
                    </span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronUp className="ml-2 size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] ml-2"
                side="top"
                align="end"
              >
                <DropdownMenuLabel>
                  {user?.profile_id}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User2 className="mr-2 size-4" />
                      <span>{t('nav.profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 size-4" />
                      <span>{t('nav.settings')}</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 size-4" />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function SidebarLayout() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const location = useLocation()

  // Derive page title from path
  const pageTitle = () => {
    const path = location.pathname.split('/')[1]
    const map: Record<string, string> = {
      dashboard: t('nav.dashboard'),
      profile: t('nav.profile'),
      circulars: t('nav.circulars'),
      applications: t('nav.applications'),
      payments: t('nav.payments'),
      notifications: t('nav.notifications'),
      settings: t('nav.settings'),
    }
    return map[path] || t('nav.dashboard')
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <AppSidebar />
        <SidebarFloatingTrigger />
        <SidebarInset className="md:pl-8 md:peer-data-[state=collapsed]:pl-8">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-1 border-b bg-background/95 backdrop-blur-sm px-2">
            <SidebarTrigger className="md:hidden" />
            <Separator orientation="vertical" className="h-4 md:hidden" />
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium">{pageTitle()}</span>
              <span className="text-xs text-muted-foreground">
                {t('dashboard.welcome')}, {user?.applicant_name || user?.email?.split('@')[0] || ''}
              </span>
            </div>
            <LanguageSwitcher />
            <ModeToggle />
          </header>

          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}