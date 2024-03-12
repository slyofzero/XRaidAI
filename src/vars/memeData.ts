interface MemeData {
  text?: string;
  style?: string;
  description?: string;
}

export const memeData: { [key: number | string]: MemeData } = {};
