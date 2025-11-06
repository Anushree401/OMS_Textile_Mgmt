
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OnboardingForm from '@/components/onboarding/OnboardingForm';

export default async function OnboardingPage() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Check if profile already exists and is complete
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If profile exists and has required fields, redirect to dashboard
  if (profile && profile.username && profile.onboarding_completed) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OnboardingForm userId={user.id} userEmail={user.email} existingProfile={profile} />
    </div>
  );
}
