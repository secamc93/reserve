declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<any> | undefined): T;
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;
  
  interface JSX {
    IntrinsicElements: any;
  }
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function usePathname(): string;
} 