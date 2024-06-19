import { config } from "./../config";
import { makeLogger } from "./../logger";
import { qdrantClient } from "./../providers";
import { UserNote } from "./../types";
import { embeddingOf } from "./utils";

const logger = makeLogger("queryService");


export async function findText(query: string, userId: string, amount:number = 3): Promise<UserNote[]> {
    logger(`Searching...`);
    const embedding = await embeddingOf(query);
    let searchResult = await qdrantClient.search(config.collectionName, {
      vector: embedding,
      limit: amount,
      filter: {
        must: [
            {
                key: "userId",
                match: {
                    value: userId
                }
            }
        ]
    },
    });
    logger(`Found ${searchResult.length} results`);
    return searchResult.map((result) => {
        return {
            id: result.id + '',
            embedding: result.vector as number[],
            userId: result.payload?.userId as string,
            originalText: result.payload?.originalText as string,
            rewrittenText: result.payload?.rewrittenText as string,
            createdAt: result.payload?.createdAt as string,
        }});
  
}