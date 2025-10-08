/**
 * Página de Login
 * Server Component que importa actions y las pasa al Client Component
 */

import { LoginForm } from '@modules/auth';
import { loginAction } from '@modules/auth/infrastructure/actions';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rupu Central</h1>
          <p className="text-gray-600 mt-2">Sistema de gestión de propiedades horizontales</p>
        </div>
        
        {/* Pasamos la action como prop al Client Component */}
        <LoginForm onLogin={loginAction} />
      </div>
    </div>
  );
}

