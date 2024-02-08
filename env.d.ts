declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPEN_AI_KEY: string | undefined;
      BOT_TOKEN: string | undefined;
      BOT_USERNAME: string | undefined;
    }
  }
}

export {};
