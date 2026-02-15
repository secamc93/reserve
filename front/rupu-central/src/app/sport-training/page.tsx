/**
 * Sport Training Dashboard
 * Página principal del módulo Sport Training
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@shared/ui';

export default function SportTrainingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente a la página de jugadores
    router.replace('/sport-training/players');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="xl" text="Redirigiendo..." />
    </div>
  );
}
