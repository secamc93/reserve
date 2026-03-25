'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@shared/ui';

export default function AttendancePage() {
  const router = useRouter();

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Asistencia</h1>
          <p className="text-gray-600 mb-6">
            La asistencia se registra desde el detalle de cada sesion de entrenamiento.
            Accede a una sesion para registrar la asistencia de los jugadores.
          </p>
          <Button onClick={() => router.push('/sport-training/sessions')}>
            Ir a Sesiones
          </Button>
        </div>
      </div>
    </div>
  );
}
