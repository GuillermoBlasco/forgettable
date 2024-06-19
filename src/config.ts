
import 'dotenv/config'
import { makeLogger } from './logger';

interface Config {
    telegramBotKey: string;
    openaiKey: string;
    qdrant: {
        host: string;
        port: number;
    },
    collectionName: string;
    tempAudioDirectory: string;
}
const logger = makeLogger("config");

function getEnvOrFail(key: string) {
    const value = process.env[key];
    if (value === undefined) {
        throw Error(`Config var ${key} not provided`);
    }
    return value
}
function getEnvOrDefault(key: string, defaultValue: string) {
    const value = process.env[key];
    if (value === undefined) {
        return defaultValue
    }
    return value
}
export const config:Config = {
    telegramBotKey: getEnvOrFail('TELEGRAM_BOT_KEY'),
    openaiKey: getEnvOrFail('OPENAI_KEY'),
    qdrant: {
        host: getEnvOrFail('QDRANT_HOST'),
        port: parseInt(getEnvOrFail('QDRANT_PORT'))
    },
    collectionName: getEnvOrDefault('QDRANT_COLLECTION_NAME', 'voice-notes'),
    tempAudioDirectory: getEnvOrDefault('TEMP_AUDIO_DIRECTORY', './data/temp-audio')
}
logger("Config loaded")