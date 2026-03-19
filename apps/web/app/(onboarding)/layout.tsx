import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { auth } from '@/server/auth';
import { getDb } from '@openvitals/database/client';
import { users } from '@openvitals/database';

const ONBOARDING_COMPLETE = 9;

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const db = getDb();
  const [user] = await db
    .select({ onboardingStep: users.onboardingStep })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (user && user.onboardingStep >= ONBOARDING_COMPLETE) {
    redirect('/home');
  }

  return <>{children}</>;
}
