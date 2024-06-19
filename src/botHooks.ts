import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { telegraf } from "./providers";
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs";
import { Writable } from "stream";
import { makeLogger } from "./logger";
import { findText } from "./services/queryService";
import { storeAudio } from "./services/storeService";
import { config } from "./config";
import path from "path";

const logger = makeLogger("botHooks");
type DeleteCallback = () => void;
interface DownloadReturn {
  delete: DeleteCallback;
  path: string;
}

async function downloadFileFromTelegram(
  fileId: string
): Promise<DownloadReturn> {
  logger("Downloading file from telegram");
  const link = await telegraf.telegram.getFileLink(fileId);
  const res = await fetch(link.toString());
  // just check if the directory exists in the file system
  if (!existsSync(config.tempAudioDirectory)) {
    mkdirSync(config.tempAudioDirectory);
  }

  const filename = path.resolve(config.tempAudioDirectory, fileId + ".oga");
  await res.body!.pipeTo(Writable.toWeb(createWriteStream(filename)));
  logger("Downloaded file");
  return {
    path: filename,
    delete: () => {
      logger("Deleting file");
      unlinkSync(filename);
    },
  };
}

export function configureBotHooks(telegraf: Telegraf) {
  telegraf.start((ctx) => {
    logger("Bot started");
    ctx.reply("Welcome!");
  });
  logger("'/start' hook configured");

  telegraf.on(message("text"), async (ctx) => {
    const userId = ctx.message.from.id.toString();
    logger("Got text message");
    const text = ctx.message.text;
    const notes = await findText(text, userId, 3);
    if (notes.length === 0) {
      ctx.reply("No notes found");
      return;
    }
    notes.forEach((note) => {
      ctx.reply("Found note: \n" + note.rewrittenText);
    });
  });
  logger("message:text hook configured");

  telegraf.on(message("voice"), async (ctx) => {
    const userId = ctx.message.from.id.toString();
    logger("Got voice message");
    const audio = ctx.message.voice;
    const file_id = audio.file_id;
    const downloaded = await downloadFileFromTelegram(file_id);

    const note = await storeAudio(downloaded.path, userId);

    ctx.reply("Note stored: " + note.rewrittenText);
    downloaded.delete();
  });
  logger("message:voice hook configured");
}
