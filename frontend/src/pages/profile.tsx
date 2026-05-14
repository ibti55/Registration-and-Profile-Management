import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, User, MapPin, GraduationCap } from 'lucide-react';
import { useState } from 'react';

const profileSchema = z.object({
  applicantName: z.string().min(1, 'Name is required').max(255).optional(),
  fatherName: z.string().max(255).optional(),
  motherName: z.string().max(255).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  employmentStatus: z.string().optional(),
  quota: z.string().optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  nationality: z.string().optional(),
  hasNid: z.boolean().optional(),
  nidNumber: z.string().optional(),
  hasBirthRegistration: z.boolean().optional(),
  birthRegistrationNumber: z.string().optional(),
  hasPassport: z.boolean().optional(),
  passportNumber: z.string().optional(),
  heightCm: z.number().optional(),
  weightKg: z.number().optional(),
  chestCm: z.number().optional(),
  contactMobile: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/profile');
      return data.data;
    },
  });

  const { data: districts } = useQuery({
    queryKey: ['districts'],
    queryFn: async () => {
      const { data } = await api.get('/lookups/districts');
      return data.data as Array<{ id: number; name: string; name_bn: string }>;
    },
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile?.personalInfo ? {
      applicantName: profile.personalInfo.applicant_name || '',
      fatherName: profile.personalInfo.father_name || '',
      motherName: profile.personalInfo.mother_name || '',
      dateOfBirth: profile.personalInfo.date_of_birth?.split('T')[0] || '',
      gender: profile.personalInfo.gender || undefined,
      employmentStatus: profile.personalInfo.employment_status || '',
      quota: profile.personalInfo.quota || '',
      maritalStatus: profile.personalInfo.marital_status || undefined,
      nationality: profile.personalInfo.nationality || 'Bangladeshi',
      hasNid: profile.personalInfo.has_nid || false,
      nidNumber: profile.personalInfo.nid_number || '',
      hasBirthRegistration: profile.personalInfo.has_birth_registration || false,
      birthRegistrationNumber: profile.personalInfo.birth_registration_number || '',
      hasPassport: profile.personalInfo.has_passport || false,
      passportNumber: profile.personalInfo.passport_number || '',
      heightCm: profile.personalInfo.height_cm || undefined,
      weightKg: profile.personalInfo.weight_kg || undefined,
      chestCm: profile.personalInfo.chest_cm || undefined,
      contactMobile: profile.personalInfo.contact_mobile || '',
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const payload = {
        personalInfo: data,
        presentAddress: presentAddr,
        permanentAddress: permanentAddr,
      };
      return api.put('/profile', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSuccessMsg(t('profile.updateSuccess'));
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  const [presentAddr, setPresentAddr] = useState<Record<string, string>>({});
  const [permanentAddr, setPermanentAddr] = useState<Record<string, string>>({});

  // Initialize addresses from profile
  if (profile?.presentAddress && Object.keys(presentAddr).length === 0) {
    setPresentAddr({
      careOf: profile.presentAddress.care_of || '',
      villageTownRoad: profile.presentAddress.village_town_road || '',
      district: profile.presentAddress.district || '',
      upazilla: profile.presentAddress.upazilla || '',
      postOffice: profile.presentAddress.post_office || '',
      postCode: profile.presentAddress.post_code || '',
    });
  }
  if (profile?.permanentAddress && Object.keys(permanentAddr).length === 0) {
    setPermanentAddr({
      careOf: profile.permanentAddress.care_of || '',
      villageTownRoad: profile.permanentAddress.village_town_road || '',
      district: profile.permanentAddress.district || '',
      upazilla: profile.permanentAddress.upazilla || '',
      postOffice: profile.permanentAddress.post_office || '',
      postCode: profile.permanentAddress.post_code || '',
    });
  }

  const onSubmit = (data: ProfileForm) => {
    mutation.mutate(data);
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
        <h2 className="text-xl font-semibold">{t('profile.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('profile.subtitle')}</p>
      </section>

      {successMsg && (
        <div className="rounded-md bg-emerald-100 p-3 text-sm text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
          {successMsg}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="gap-2">
              <User className="h-4 w-4" /> {t('profile.personalInfo')}
            </TabsTrigger>
            <TabsTrigger value="address" className="gap-2">
              <MapPin className="h-4 w-4" /> {t('profile.address')}
            </TabsTrigger>
            <TabsTrigger value="education" className="gap-2">
              <GraduationCap className="h-4 w-4" /> {t('profile.education')}
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('profile.personalInfo')}</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('profile.applicantName')}</Label>
                  <Input {...form.register('applicantName')} />
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.fatherName')}</Label>
                  <Input {...form.register('fatherName')} />
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.motherName')}</Label>
                  <Input {...form.register('motherName')} />
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.dateOfBirth')}</Label>
                  <Input type="date" {...form.register('dateOfBirth')} />
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.gender')}</Label>
                  <Select
                    value={form.watch('gender') || ''}
                    onValueChange={(v) => form.setValue('gender', v as 'male' | 'female' | 'other')}
                  >
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('profile.male')}</SelectItem>
                      <SelectItem value="female">{t('profile.female')}</SelectItem>
                      <SelectItem value="other">{t('profile.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.maritalStatus')}</Label>
                  <Select
                    value={form.watch('maritalStatus') || ''}
                    onValueChange={(v) => form.setValue('maritalStatus', v as 'single' | 'married' | 'divorced' | 'widowed')}
                  >
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">{t('profile.single')}</SelectItem>
                      <SelectItem value="married">{t('profile.married')}</SelectItem>
                      <SelectItem value="divorced">{t('profile.divorced')}</SelectItem>
                      <SelectItem value="widowed">{t('profile.widowed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.nationality')}</Label>
                  <Input {...form.register('nationality')} />
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.contactMobile')}</Label>
                  <Input {...form.register('contactMobile')} placeholder="+880" />
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.nidNumber')}</Label>
                  <Input {...form.register('nidNumber')} />
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.height')}</Label>
                  <Input type="number" step="0.1" {...form.register('heightCm', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.weight')}</Label>
                  <Input type="number" step="0.1" {...form.register('weightKg', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.chest')}</Label>
                  <Input type="number" step="0.1" {...form.register('chestCm', { valueAsNumber: true })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Address Tab */}
          <TabsContent value="address">
            <div className="space-y-6">
              {(['present', 'permanent'] as const).map((type) => {
                const addr = type === 'present' ? presentAddr : permanentAddr;
                const setAddr = type === 'present' ? setPresentAddr : setPermanentAddr;
                return (
                  <Card key={type}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {type === 'present' ? t('profile.presentAddress') : t('profile.permanentAddress')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t('profile.careOf')}</Label>
                        <Input value={addr.careOf || ''} onChange={(e) => setAddr({ ...addr, careOf: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('profile.villageTownRoad')}</Label>
                        <Input value={addr.villageTownRoad || ''} onChange={(e) => setAddr({ ...addr, villageTownRoad: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('profile.district')}</Label>
                        <Select value={addr.district || ''} onValueChange={(v) => setAddr({ ...addr, district: v })}>
                          <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                          <SelectContent>
                            {districts?.map((d) => (
                              <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('profile.upazilla')}</Label>
                        <Input value={addr.upazilla || ''} onChange={(e) => setAddr({ ...addr, upazilla: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('profile.postOffice')}</Label>
                        <Input value={addr.postOffice || ''} onChange={(e) => setAddr({ ...addr, postOffice: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('profile.postCode')}</Label>
                        <Input value={addr.postCode || ''} onChange={(e) => setAddr({ ...addr, postCode: e.target.value })} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('profile.education')}</CardTitle>
                <CardDescription>SSC, HSC, Graduation, Masters and other qualifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(['ssc', 'hsc', 'graduation', 'masters'] as const).map((level) => (
                    <div key={level} className="rounded-lg border p-4">
                      <h4 className="mb-3 font-semibold">{t(`profile.${level}`)}</h4>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t('profile.examination')}</Label>
                          <Input placeholder={t('profile.examination')} />
                        </div>
                        {['ssc', 'hsc'].includes(level) && (
                          <div className="space-y-1">
                            <Label className="text-xs">{t('profile.board')}</Label>
                            <Input placeholder={t('profile.board')} />
                          </div>
                        )}
                        <div className="space-y-1">
                          <Label className="text-xs">{t('profile.result')}</Label>
                          <Input placeholder={t('profile.result')} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('profile.passingYear')}</Label>
                          <Input placeholder="2020" />
                        </div>
                        {['graduation', 'masters'].includes(level) && (
                          <>
                            <div className="space-y-1">
                              <Label className="text-xs">{t('profile.subjectDegree')}</Label>
                              <Input placeholder={t('profile.subjectDegree')} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">{t('profile.university')}</Label>
                              <Input placeholder={t('profile.university')} />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={mutation.isPending} className="gap-2">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t('app.save')}
          </Button>
        </div>
      </form>
    </main>
  );
}
