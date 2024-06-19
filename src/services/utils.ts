import { openai } from "../providers";

export const embeddingOf = async (text: string): Promise<number[]> => {
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
      encoding_format: "float",
    });
    const embedding = embeddingResponse.data[0].embedding;
    return embedding;
  };