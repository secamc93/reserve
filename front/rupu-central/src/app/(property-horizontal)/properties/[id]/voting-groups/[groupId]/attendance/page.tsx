/**
 * Page: Attendance Management for Voting Groups
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PropertyNavigation } from '@modules/property-horizontal/ui/components';
import { AttendanceManagement } from '@modules/property-horizontal/ui/attendance';
import { TokenStorage } from '@shared/config';

export default function AttendanceManagementPage() {
  const params = useParams();
  const router = useRouter();
  const [token, setToken] = useState<string>('');

  const businessId = parseInt(params.id as string);
  const groupId = parseInt(params.groupId as string);

  useEffect(() => {
    const userToken = TokenStorage.getToken();
    if (!userToken) {
      router.push('/login');
      return;
    }
    setToken(userToken);
  }, [router]);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <PropertyNavigation
        businessId={businessId}
        currentSection="attendance"
        groupId={groupId}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Asistencia
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las listas de asistencia para este grupo de votación
          </p>
        </div>

        {/* Attendance Management Component */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <AttendanceManagement
            votingGroupId={groupId}
            votingGroupName={`Grupo de Votación ${groupId}`} // TODO: Get actual name from API
            token={token}
            businessId={businessId}
          />
        </div>
      </div>
    </div>
  );
}

