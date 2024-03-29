import cheerio from "cheerio";
import { BOT_TOKEN } from "./env";
import { errorHandler } from "./handlers";

export async function apiFetcher<T>(url: string) {
  const response = await fetch(url);
  const data = (await response.json()) as T;
  return { response: response.status, data };
}

export async function fetchAndExtract(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const mainText = $("p, div, span, h1, h2, h3, h4, h5, h6").text(); // Extract text from all <p> elements
    return mainText;
  } catch (error) {
    errorHandler(error);
    return "";
  }
}

export async function getChannelDescription(channelUsername: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=@${channelUsername}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok) {
      const { title, description } = data.result;
      return `${description}\nTitle - ${title}`;
    } else {
      throw new Error(data.description);
    }
  } catch (error) {
    errorHandler(error);
    return "";
  }
}
