interface ShillTextData {
  platform?: "reddit" | "twitter" | "telegram";
  name?: string;
  description?: string;
}

export const shillTextData: { [key: number | string]: ShillTextData } = {};
