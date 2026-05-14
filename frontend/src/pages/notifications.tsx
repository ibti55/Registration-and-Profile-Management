import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, CheckCheck, Mail, MessageSquare, MonitorSmartphone } from 'lucide-react';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications?limit=50');
      return data.data as {
        notifications: Array<Record<string, unknown>>;
        unreadCount: number;
        total: number;
      };
    },
  });

  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/preferences');
      return data.data as Record<string, boolean> | null;
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const updatePrefs = useMutation({
    mutationFn: (prefs: Record<string, boolean>) => api.put('/notifications/preferences', prefs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-preferences'] }),
  });

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-6 px-4 py-6">
      <section className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t('notification.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('notification.subtitle')} ({data?.unreadCount || 0} unread)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || data?.unreadCount === 0}
        >
          <CheckCheck className="h-4 w-4" /> {t('notification.markAllRead')}
        </Button>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-3">
          {!data?.notifications || data.notifications.length === 0 ? (
            <div className="py-20 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">{t('notification.noNotifications')}</p>
            </div>
          ) : (
            data.notifications.map((n) => (
              <Card
                key={n.id as string}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !(n.is_read as boolean) ? 'border-primary/30 bg-primary/5' : ''
                }`}
                onClick={() => {
                  if (!(n.is_read as boolean)) markRead.mutate(n.id as string);
                }}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <Bell className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                    !(n.is_read as boolean) ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className={`text-sm ${!(n.is_read as boolean) ? 'font-semibold' : 'font-medium'}`}>
                        {n.title as string}
                      </p>
                      <span className="ml-2 whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(n.created_at as string).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {n.message as string}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Preferences */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">{t('notification.preferences')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'emailEnabled', label: t('notification.emailAlerts'), icon: Mail },
              { key: 'smsEnabled', label: t('notification.smsAlerts'), icon: MessageSquare },
              { key: 'dashboardEnabled', label: t('notification.dashboardAlerts'), icon: MonitorSmartphone },
            ].map((pref) => (
              <label
                key={pref.key}
                className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <pref.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{pref.label}</span>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-primary"
                  checked={preferences?.[pref.key] ?? true}
                  onChange={(e) => updatePrefs.mutate({ [pref.key]: e.target.checked })}
                />
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
