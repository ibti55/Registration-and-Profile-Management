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
import { UserPlus, Loader2, CheckCircle, KeyRound, Mail } from 'lucide-react';
import api from '@/lib/api';

// Step schemas
const emailSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type EmailForm = z.infer<typeof emailSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

type Step = 'email' | 'otp' | 'password' | 'success';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { setPassword } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileId, setProfileId] = useState('');

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onEmailSubmit = async (data: EmailForm) => {
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { email: data.email });
      setEmail(data.email);
      setStep('otp');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit = async (data: OtpForm) => {
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-otp', { email, otp: data.otp });
      setOtp(data.otp);
      setStep('password');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await setPassword(email, otp, data.password);
      setProfileId(result.profileId);
      setStep('success');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Account creation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/resend-otp', { email });
      setError('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = ['email', 'otp', 'password', 'success'] as const;
  const currentStepIndex = steps.indexOf(step);

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
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{t('auth.registerTitle')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('auth.registerSubtitle')}</p>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  i <= currentStepIndex
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < currentStepIndex ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-8 rounded ${i < currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-lg">
          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5" />
                  {t('auth.register')}
                </CardTitle>
                <CardDescription>{t('auth.registerSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your-email@example.com"
                    {...emailForm.register('email')}
                    className={emailForm.formState.errors.email ? 'border-destructive' : ''}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {t('app.next')}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {t('auth.hasAccount')}{' '}
                  <Link to="/login" className="font-medium text-primary hover:underline">{t('auth.login')}</Link>
                </p>
              </CardFooter>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <KeyRound className="h-5 w-5" />
                  {t('auth.otpTitle')}
                </CardTitle>
                <CardDescription>{t('auth.otpSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                <div className="rounded-md bg-muted/50 p-3 text-sm">
                  <span className="text-muted-foreground">Sent to: </span>
                  <span className="font-medium">{email}</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp">{t('auth.otpLabel')}</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className={`text-center text-2xl tracking-[0.5em] font-mono ${otpForm.formState.errors.otp ? 'border-destructive' : ''}`}
                    {...otpForm.register('otp')}
                  />
                  {otpForm.formState.errors.otp && (
                    <p className="text-xs text-destructive">{otpForm.formState.errors.otp.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('app.next')}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={resendOtp} disabled={isLoading}>
                  {t('auth.otpResend')}
                </Button>
              </CardFooter>
            </form>
          )}

          {/* Password Step */}
          {step === 'password' && (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <KeyRound className="h-5 w-5" />
                  {t('auth.passwordTitle')}
                </CardTitle>
                <CardDescription>{t('auth.passwordSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                  {t('auth.passwordRules')}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...passwordForm.register('password')}
                    className={passwordForm.formState.errors.password ? 'border-destructive' : ''}
                  />
                  {passwordForm.formState.errors.password && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...passwordForm.register('confirmPassword')}
                    className={passwordForm.formState.errors.confirmPassword ? 'border-destructive' : ''}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('auth.register')}
                </Button>
              </CardFooter>
            </form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">{t('auth.registrationSuccess')}</CardTitle>
                <CardDescription>{t('auth.profileId')}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-2xl font-bold tracking-wider text-primary">{profileId}</p>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Save this profile ID for your records. You can now complete your profile.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
