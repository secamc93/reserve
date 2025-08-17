'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/server/config/env';
import { LoginResponse } from '@/services/auth/domain/entities/loging_response';
import { LoginRequest } from '@/services/auth/infrastructure/actions/request/login';
import { LoginCredentials } from '@/services/auth/domain/entities/Auth';
import { 
  mapLoginRequestToLoginCredentials,
  mapLoginResponseToDomain
} from '@/services/auth/infrastructure/actions/mappers';

export async function loginAction(request: LoginRequest): Promise<LoginResponse> {
  try {
    const loginCredentials: LoginCredentials = mapLoginRequestToLoginCredentials(request);
    
    const { email, password } = loginCredentials;

    const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return data;
    }
    
    const mappedResponse = mapLoginResponseToDomain(data.data);
    
    const cookieStore = await cookies();
    cookieStore.set('auth-token', mappedResponse.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    const userWithBusinesses = {
      ...mappedResponse.user,
      businesses: mappedResponse.businesses
    };
    
    cookieStore.set('user-info', JSON.stringify(userWithBusinesses), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return {
      success: true,
      data: mappedResponse
    };
  } catch (error) {
    console.error('Login action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
} 