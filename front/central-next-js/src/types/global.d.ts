/// <reference types="react" />

// Tipos globales para React
declare module 'react' {
  // Hooks básicos
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<any> | undefined): T;
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useContext<T>(context: React.Context<T>): T;
  
  // Context
  export function createContext<T>(defaultValue: T): React.Context<T>;
  
  // Tipos
  export type ReactNode = any;
  export type FC<P = {}> = React.FunctionComponent<P>;
  export type MouseEvent<T = Element> = any;
  export type ChangeEvent<T = Element> = any;
  export type FormEvent<T = Element> = any;
  
  // Interfaces
  interface Context<T> {
    Provider: React.Provider<T>;
    Consumer: React.Consumer<T>;
    displayName?: string;
  }
  
  interface Provider<T> {
    (props: { value: T; children?: ReactNode }): ReactNode;
  }
  
  interface Consumer<T> {
    (props: { children: (value: T) => ReactNode }): ReactNode;
  }
  
  interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactNode;
    displayName?: string;
  }
  
  interface JSX {
    IntrinsicElements: any;
  }
}

// Tipos para Next.js
declare module 'next/navigation' {
  export function useRouter(): any;
  export function usePathname(): string;
} 