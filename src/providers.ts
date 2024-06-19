import OpenAI from "openai";
import { config } from "./config";
import { QdrantClient } from "@qdrant/js-client-rest";
import { Telegraf } from "telegraf";
import { makeLogger } from "./logger";

const logger = makeLogger("providers");
export const openai = new OpenAI({
    apiKey: config.openaiKey,
});
logger("OpenAI client created");
export const qdrantClient = new QdrantClient({ host: config.qdrant.host, port: config.qdrant.port });
logger("Qdrant client created");
export const telegraf = new Telegraf(config.telegramBotKey);
logger("Telegraf client created");


async function ensureCollectionExists() {
    const collectionExists = await qdrantClient.collectionExists(config.collectionName);
    if (!collectionExists.exists) {
      logger("Creating collection");
      await qdrantClient.createCollection(config.collectionName, {
          vectors: { size: 1536, distance: "Cosine" },
        });
    } else {
      logger("Collection already exists");
    }
}
ensureCollectionExists();