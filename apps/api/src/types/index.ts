export interface Env {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
    LINE_CHANNEL_ID: string;
    LINE_CHANNEL_SECRET: string;
    LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: string;
  };
  Variables: {
    userId: string;
    userRole: string;
  };
}
