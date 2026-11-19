import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function RegisterPage() {
  return (
    <AuthLayout>
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </AuthLayout>
  );
}
