import { getDocument } from "@/firebase";
import { log } from "@/utils/handlers";

export let storedProjectIds: number[] = [];

export async function syncProjectIds() {
  const projectInfos = await getDocument({
    collectionName: "project_ids",
  });

  storedProjectIds = projectInfos.map(({ chatId }) => chatId);
  log(`Synced project ids, currently ${storedProjectIds.length} using`);
}
