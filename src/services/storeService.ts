import { createReadStream } from "fs";
import { config } from "./../config";
import { makeLogger } from "./../logger";
import { openai, qdrantClient } from "./../providers";
import { UserNote } from "./../types";
import { v4 as uuidv4 } from "uuid";
import { embeddingOf } from "./utils";

const logger = makeLogger("storeService");

const voiceNoteRewriteTemplate = (transcription: string) => `
### VOICE TRANSCRIPTION STARTS ###
${transcription}
### VOICE TRANSCRIPTION ENDS ###

Given this transcription of the voice note, rewrite it to make it consistent and readable.
Do not omit any information, but feel free to rephrase it.
Do not paraphrase this instruction.
`;

export async function storeAudio(filePath: string, userId: string): Promise<UserNote> {
  logger(`Storing audio`);
  const transcriptionResponse = await openai.audio.transcriptions.create({
    file: createReadStream(filePath),
    model: "whisper-1",
  });
  logger(`Got audio transcription`);
  return storeText(transcriptionResponse.text, userId);
}

export async function storeText(text: string, userId: string): Promise<UserNote> {
  logger(`Storing text`);
  const gptResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: voiceNoteRewriteTemplate(text),
      },
    ],
  });
  const textRewrite = gptResponse.choices[0].message.content;
  if (textRewrite === undefined || textRewrite === null || textRewrite === "") {
    throw new Error("No response from GPT-3");
  }
  logger(`Got text rewritten`);
  const embedding = await embeddingOf(textRewrite);
  logger(`Got text embedding`);

  const note: UserNote = {
    id: uuidv4(),
    embedding: embedding,
    originalText: text,
    rewrittenText: textRewrite,
    userId: userId,
    createdAt: new Date().toUTCString(),
  };
  const { id, embedding: vector, ...rest } = note;
  const qdrantResponse = await qdrantClient.upsert(config.collectionName, {
    wait: true,
    points: [
      {
        id,
        vector,
        payload: rest,
      },
    ],
  });
  logger(`Stored note`);
  return note;
}
