interface ShillTextData {
  platform?: "reddit" | "twitter" | "telegram";
  name?: string;
  description?: string;
  mode?: "utility" | "meme";
  socials?: string;
  focus?: string;
}

export const shillTextData: { [key: number | string]: ShillTextData } = {};
