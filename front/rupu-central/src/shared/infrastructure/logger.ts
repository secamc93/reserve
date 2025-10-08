/**
 * Logger compartido (server-only)
 */

export class Logger {
  static info(message: string, meta?: unknown) {
    console.log(`[INFO] ${message}`, meta || '');
  }

  static error(message: string, error?: unknown) {
    console.error(`[ERROR] ${message}`, error || '');
  }

  static warn(message: string, meta?: unknown) {
    console.warn(`[WARN] ${message}`, meta || '');
  }

  static debug(message: string, meta?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, meta || '');
    }
  }
}

