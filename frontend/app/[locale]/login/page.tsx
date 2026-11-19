import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </AuthLayout>
  );
}
