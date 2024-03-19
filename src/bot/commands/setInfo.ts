import { addDocument } from "@/firebase";
import { urlRegex } from "@/utils/constants";
import { errorHandler } from "@/utils/handlers";
import { projectInfos, syncProjectInfo } from "@/vars/info";
import { userState } from "@/vars/userState";
import { CommandContext, Context } from "grammy";

export async function setInfo(ctx: CommandContext<Context>) {
  const { type, id } = ctx.chat;

  if (type === "private") {
    return ctx.reply(
      "The /setinfo command is only for groups and channels. You can use /generate and customize."
    );
  } else if (type === "group") {
    return ctx.reply(
      "To use this command, please make the bot an admin in the group and give it all permissions. This would allow the bot to read all messages being posted in the group and reply accordingly to them."
    );
  }

  userState[id] = "info-tone";

  const text = `What should be the tone of the shill text that would be generated. Type in multiple such tones so that the bot can pick any one of them whenever generating to get a nice variety in the text.\n\nExample - funny, informal, lots of emojis`;

  return ctx.reply(text);
}

export async function infoStep1(ctx: CommandContext<Context>) {
  const { id } = ctx.chat;
  const tone = ctx.channelPost?.text || ctx.update.message?.text || "";

  if (!tone) {
    return ctx.reply("Invalid input, please enter valid tones");
  }

  projectInfos[id] = { tone };

  userState[id] = "info-name";
  const text = `What is the name of your project?`;

  return ctx.reply(text);
}

export async function infoStep2(ctx: CommandContext<Context>) {
  const { id } = ctx.chat;
  const name = ctx.channelPost?.text || ctx.update.message?.text || "";

  if (!name) {
    return ctx.reply("Invalid input, please enter valid tones");
  }

  projectInfos[id].name = name;

  userState[id] = "info-description";
  const text = `Provide some brief description about your project, anything relevant you might want the shill text to have.`;

  return ctx.reply(text);
}

export async function infoStep3(ctx: CommandContext<Context>) {
  const { id } = ctx.chat;
  const description = ctx.channelPost?.text || ctx.update.message?.text || "";

  if (!description) {
    return ctx.reply("Invalid input, please enter a valid description");
  }

  projectInfos[id].description = description;

  userState[id] = "info-socials";
  const text = `Please provide a social link related to your project, preferably your website. The bot would use the data on your socials to gather more information about your project resulting in more accurate texts.`;

  return ctx.reply(text);
}

export async function confirmInfo(ctx: CommandContext<Context>) {
  const { id, type } = ctx.chat;
  const socials = ctx.channelPost?.text || ctx.update.message?.text || "";

  for (const social of socials.split(" ")) {
    if (!urlRegex.test(social)) {
      return ctx.reply("Invalid input, please enter valid social links");
    }
  }

  projectInfos[id].socials = socials;

  delete userState[id];
  const text = `Project info set for this ${type}! You can now do /generate and see multiple shill texts with data relevant to your project. If you don't like the results, try changing the project info using /setinfo.`;

  addDocument({
    data: { chatId: id, ...projectInfos[id] },
    collectionName: "project_info",
  })
    .then(() => syncProjectInfo())
    .catch((e) => errorHandler(e));

  return ctx.reply(text);
}
