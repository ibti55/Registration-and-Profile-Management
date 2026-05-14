import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ModeToggle } from '@/components/mode-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { LogIn, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4 py-10">
      <div className="absolute top-4 right-4 flex gap-2">
        <LanguageSwitcher />
        <ModeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/src/assets/Government_Seal_of_Bangladesh.svg"
            alt="BPSC Seal"
            className="mx-auto h-16 w-16 rounded-full bg-white p-1 shadow-md"
          />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{t('auth.loginTitle')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('auth.loginSubtitle')}</p>
        </div>

        <Card className="shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="text-lg">{t('auth.login')}</CardTitle>
              <CardDescription>{t('app.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {t('auth.login')}
              </Button>
              <p className="text-sm text-muted-foreground">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  {t('auth.register')}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
