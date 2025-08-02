'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al login
    router.push('/auth/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">⚡ Rupü</h1>
        <p className="text-gray-600">Redirigiendo al login...</p>
      </div>
    </div>
  );
}
