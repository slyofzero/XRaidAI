declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPEN_AI_KEY: string | undefined;
      BOT_TOKEN: string | undefined;
      BOT_USERNAME: string | undefined;
      ENCRYPTION_KEY: string | undefined;
      RPC_URL: string | undefined;
      FIREBASE_KEY: string | undefined;
    }
  }
}

export {};
