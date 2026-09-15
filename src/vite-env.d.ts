/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PYTHON_API_URL?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
