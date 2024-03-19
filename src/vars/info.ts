import { getDocument } from "@/firebase";
import { log } from "@/utils/handlers";

export interface ProjectInfo {
  chatId?: number;
  tone?: string;
  name?: string;
  description?: string;
  socials?: string;
}

export const projectInfos: { [key: number]: ProjectInfo } = {};

export let storedProjectInfos: ProjectInfo[] = [];

export async function syncProjectInfo() {
  const projectInfos = (await getDocument({
    collectionName: "project_info",
  })) as ProjectInfo[];

  storedProjectInfos = projectInfos;

  log("Synced project infos");
}
