import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText, CreditCard, Calendar, Bell, User, ScrollText, ClipboardList, ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: applications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const { data } = await api.get('/applications');
      return data.data as Array<Record<string, unknown>>;
    },
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications?limit=5');
      return data.data as { notifications: Array<Record<string, unknown>>; unreadCount: number };
    },
  });

  const { data: circulars } = useQuery({
    queryKey: ['circulars'],
    queryFn: async () => {
      const { data } = await api.get('/circulars');
      return data.data as Array<Record<string, unknown>>;
    },
  });

  const activeApps = applications?.filter((a) => !['cancelled', 'suspended'].includes(a.status as string)) || [];
  const pendingPayments = applications?.filter((a) => a.status === 'submitted' && !a.payment_status) || [];
  const unreadCount = notifications?.unreadCount || 0;

  const statusVariant = (status: string) => {
    const map: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
      draft: 'secondary',
      submitted: 'default',
      finalized: 'success',
      payment_pending: 'warning',
      payment_completed: 'success',
      cancelled: 'destructive',
    };
    return map[status] || 'secondary';
  };

  return (
    <main className="flex-1 space-y-6 px-4 py-6">
      {/* Welcome */}
      <section>
        <h2 className="text-xl font-semibold">
          {t('dashboard.welcome')}, {user?.applicant_name || user?.email?.split('@')[0] || 'Applicant'}
        </h2>
        <p className="text-sm text-muted-foreground">{t('dashboard.overviewSubtitle')}</p>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          Profile ID: <span className="font-mono font-semibold text-primary">{user?.profile_id}</span>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: t('dashboard.activeApplications'), value: activeApps.length, icon: FileText, color: 'text-primary' },
          { title: t('dashboard.pendingPayments'), value: pendingPayments.length, icon: CreditCard, color: 'text-amber-500' },
          { title: t('dashboard.upcomingExams'), value: circulars?.length || 0, icon: Calendar, color: 'text-blue-500' },
          { title: t('dashboard.unreadNotifications'), value: unreadCount, icon: Bell, color: 'text-red-500' },
        ].map((stat) => (
          <Card key={stat.title} className="transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Quick Actions */}
      <section>
        <h3 className="mb-3 text-base font-semibold">{t('dashboard.quickActions')}</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/profile">
            <Button variant="outline" className="gap-2">
              <User className="h-4 w-4" /> {t('dashboard.updateProfile')}
            </Button>
          </Link>
          <Link to="/circulars">
            <Button variant="outline" className="gap-2">
              <ScrollText className="h-4 w-4" /> {t('dashboard.browseCirculars')}
            </Button>
          </Link>
          <Link to="/applications">
            <Button variant="outline" className="gap-2">
              <ClipboardList className="h-4 w-4" /> {t('dashboard.viewApplications')}
            </Button>
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">{t('application.title')}</CardTitle>
            <Link to="/applications">
              <Button variant="ghost" size="sm" className="gap-1">
                {t('dashboard.viewAll')} <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {activeApps.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('app.noData')}</p>
            ) : (
              <div className="space-y-3">
                {activeApps.slice(0, 5).map((app) => (
                  <div
                    key={app.id as string}
                    className="flex items-center justify-between rounded-lg border bg-background px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{app.title as string}</p>
                      <p className="text-xs text-muted-foreground">
                        {t(`circular.${app.exam_type as string}`)}
                      </p>
                    </div>
                    <Badge variant={statusVariant(app.status as string)}>
                      {t(`application.${app.status as string}`)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">{t('notification.title')}</CardTitle>
            <Link to="/notifications">
              <Button variant="ghost" size="sm" className="gap-1">
                {t('dashboard.viewAll')} <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {(!notifications?.notifications || notifications.notifications.length === 0) ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('notification.noNotifications')}</p>
            ) : (
              <div className="space-y-3">
                {notifications.notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id as string}
                    className={`flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      !(n.is_read as boolean) ? 'bg-primary/5 border-primary/20' : 'bg-background'
                    }`}
                  >
                    <Bell className={`mt-0.5 h-4 w-4 flex-shrink-0 ${!(n.is_read as boolean) ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium">{n.title as string}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(n.created_at as string).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
