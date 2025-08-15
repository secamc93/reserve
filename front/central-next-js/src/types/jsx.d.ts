/// <reference types="react" />

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react' {
  interface JSX {
    IntrinsicElements: any;
  }
} 