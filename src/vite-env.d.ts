/// <reference types="vite/client" />

// CSS Modules 类型声明
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// 环境变量类型
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

