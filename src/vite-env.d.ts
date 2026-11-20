/// <reference types="vite/client" />
import 'vite';

declare module 'vite' {
  interface UserConfig {
    lint?: unknown;
    fmt?: unknown;
  }
}
