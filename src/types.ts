

export interface UserNote {
    id: string;
    userId: string;
    embedding: number[];
    originalText: string;
    rewrittenText: string;
    createdAt: string;
}