'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SetupWizardForm } from '@/components/setup/SetupWizardForm';
import { SetupFormData } from '@/lib/validations/setup';
import { completeSetupWizard } from '@/lib/actions/setup';

export default function SetupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetupSubmit = async (data: SetupFormData, userId?: string) => {
    setIsSubmitting(true);
    try {
      const result = await completeSetupWizard(data, userId);
      if (result.success) {
        router.push('/threads');
      } else {
        alert(result.error || 'Failed to complete setup');
      }
    } catch (err: any) {
      alert(err.message || 'Setup network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900">
      <SetupWizardForm onSubmit={handleSetupSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}