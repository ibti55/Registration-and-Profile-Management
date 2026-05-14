import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, CreditCard, ClipboardList } from 'lucide-react';

export default function ApplicationsPage() {
  const { t } = useTranslation();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const { data } = await api.get('/applications');
      return data.data as Array<Record<string, unknown>>;
    },
  });

  const statusVariant = (status: string) => {
    const map: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
      draft: 'secondary',
      submitted: 'default',
      finalized: 'success',
      payment_pending: 'warning',
      payment_completed: 'success',
      cancelled: 'destructive',
      suspended: 'destructive',
    };
    return map[status] || 'secondary';
  };

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
          <h2 className="text-xl font-semibold">{t('application.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('application.subtitle')}</p>
        </div>
        <Link to="/circulars">
          <Button variant="outline">{t('dashboard.browseCirculars')}</Button>
        </Link>
      </section>

      {!applications || applications.length === 0 ? (
        <div className="py-20 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">{t('app.noData')}</p>
          <Link to="/circulars">
            <Button className="mt-4">{t('dashboard.browseCirculars')}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id as string} className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-base">{app.title as string}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t(`circular.${app.exam_type as string}`)} •{' '}
                    Deadline: {new Date(app.application_end_date as string).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={statusVariant(app.status as string)}>
                  {t(`application.${app.status as string}`)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-3">
                  {app.exam_date && (
                    <span className="text-xs text-muted-foreground">
                      {t('circular.examDate')}: {new Date(app.exam_date as string).toLocaleDateString()}
                    </span>
                  )}
                  {app.fee_amount && (
                    <span className="text-xs text-muted-foreground">
                      {t('circular.fee')}: ৳{app.fee_amount as number}
                    </span>
                  )}
                  {app.payment_status === 'completed' && (
                    <Badge variant="success" className="text-xs">✓ Paid</Badge>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={`/applications/${app.id as string}`}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Eye className="h-3 w-3" /> {t('application.viewDetails')}
                    </Button>
                  </Link>
                  {app.status === 'submitted' && !app.payment_status && (
                    <Button size="sm" className="gap-1" onClick={async () => {
                      try {
                        await api.post('/payments/initiate', { applicationId: app.id });
                        // In production, redirect to payment gateway
                      } catch {
                        // Handle error
                      }
                    }}>
                      <CreditCard className="h-3 w-3" /> {t('application.payNow')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
