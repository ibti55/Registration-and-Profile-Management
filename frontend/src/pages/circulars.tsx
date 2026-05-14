import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Banknote, ScrollText, Loader2 } from 'lucide-react';

export default function CircularsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: circulars, isLoading } = useQuery({
    queryKey: ['circulars'],
    queryFn: async () => {
      const { data } = await api.get('/circulars');
      return data.data as Array<Record<string, unknown>>;
    },
  });

  const getStatus = (start: string, end: string) => {
    const now = new Date();
    if (now < new Date(start)) return 'not_open';
    if (now > new Date(end)) return 'closed';
    return 'open';
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
      <section>
        <h2 className="text-xl font-semibold">{t('circular.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('circular.subtitle')}</p>
      </section>

      {!circulars || circulars.length === 0 ? (
        <div className="py-20 text-center">
          <ScrollText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">{t('app.noData')}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {circulars.map((c) => {
            const status = getStatus(
              c.application_start_date as string,
              c.application_end_date as string
            );
            return (
              <Card key={c.id as string} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base leading-snug">
                      {c.title as string}
                    </CardTitle>
                    <Badge variant={
                      status === 'open' ? 'success' :
                      status === 'closed' ? 'destructive' : 'warning'
                    }>
                      {status === 'open' ? 'Open' :
                       status === 'closed' ? t('circular.windowClosed') :
                       t('circular.windowNotOpen')}
                    </Badge>
                  </div>
                  {c.title_bn && (
                    <p className="text-sm text-muted-foreground">{c.title_bn as string}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {c.description as string}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{t('circular.deadline')}: {new Date(c.application_end_date as string).toLocaleDateString()}</span>
                    </div>
                    {c.exam_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{t('circular.examDate')}: {new Date(c.exam_date as string).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Banknote className="h-4 w-4" />
                      <span>{t('circular.fee')}: ৳{c.fee_amount as number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{t(`circular.${c.exam_type as string}`)}</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    disabled={status !== 'open'}
                    onClick={async () => {
                      try {
                        const { data } = await api.post('/applications', { circularId: c.id });
                        navigate(`/applications/${data.data.id}`);
                      } catch {
                        // Handle error
                      }
                    }}
                  >
                    {t('circular.applyNow')}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
