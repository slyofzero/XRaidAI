export interface BotGroupReply {
  text: string;
  startTime: number;
  focus: string;
}

export const botGroupReplies: {
  [key: number]: {
    [key: number]: {
      [key: number]: BotGroupReply;
    };
  };
} = {};
