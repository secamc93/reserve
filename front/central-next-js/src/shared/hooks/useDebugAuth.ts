'use client';

import { useEffect, useRef } from 'react';

export const useDebugAuth = (hookName: string) => {
  const callCount = useRef(0);
  const lastCall = useRef<Date>(new Date());

  useEffect(() => {
    callCount.current += 1;
    const now = new Date();
    const timeDiff = now.getTime() - lastCall.current.getTime();
    
    console.log(`🔍 [${hookName}] Llamada #${callCount.current} - Tiempo desde última: ${timeDiff}ms`);
    
    if (callCount.current > 5) {
      console.warn(`⚠️ [${hookName}] Muchas llamadas detectadas: ${callCount.current}`);
    }
    
    lastCall.current = now;
  });

  return { callCount: callCount.current };
}; 