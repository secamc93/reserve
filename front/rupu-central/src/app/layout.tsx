/**
 * Layout principal de la aplicación
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@shared/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rupü Central - Sistema de Gestión',
  description: 'Sistema de gestión de propiedades horizontales con arquitectura modular',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
