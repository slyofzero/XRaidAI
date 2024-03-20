import dotenv from "dotenv";
dotenv.config();

export const {
  BOT_TOKEN,
  BOT_USERNAME,
  OPEN_AI_KEY,
  RPC_URL,
  FIREBASE_KEY,
  ENCRYPTION_KEY,
  IMAGE_API_KEY,
  XRAID_PROJECT_ID,
} = process.env;
