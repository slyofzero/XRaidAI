import { ChatCompletionMessageParam } from "openai/resources";

export const conversations: { [key: number]: ChatCompletionMessageParam[] } =
  {};
export const memeConversations: { [key: number]: string } = {};
