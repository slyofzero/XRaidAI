interface BotGroupReply {
  text: string;
  startTime: number;
}

export const botGroupReplies: {
  [key: number]: {
    [key: number]: BotGroupReply;
  };
} = {};
