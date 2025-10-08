/**
 * Route Handler: POST /api/auth/login
 * Endpoint REST que expone la funcionalidad de login para consumo externo
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginAction } from '@modules/auth/infrastructure/actions';
import { Logger } from '@shared/infrastructure';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validar entrada
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    Logger.info('Login attempt', { email });

    // Llamar a la action del módulo
    const result = await loginAction({ email, password });

    if (!result.success) {
      Logger.warn('Login failed', { email, error: result.error });
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    Logger.info('Login successful', { email });

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    Logger.error('Login error', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

