import { Client } from "@elastic/elasticsearch";
import { Embeddings } from "../embeddings/base.js";
import { Document } from "../document.js";
import { VectorStore } from "./base.js";
type ElasticKnnEngine = "hnsw";
type ElasticSimilarity = "l2_norm" | "dot_product" | "cosine";
interface VectorSearchOptions {
    readonly engine?: ElasticKnnEngine;
    readonly similarity?: ElasticSimilarity;
    readonly m?: number;
    readonly efConstruction?: number;
    readonly candidates?: number;
}
export interface ElasticClientArgs {
    readonly client: Client;
    readonly indexName?: string;
    readonly vectorSearchOptions?: VectorSearchOptions;
}
type ElasticFilter = object;
export declare class ElasticVectorSearch extends VectorStore {
    FilterType: ElasticFilter;
    private readonly client;
    private readonly indexName;
    private readonly engine;
    private readonly similarity;
    private readonly efConstruction;
    private readonly m;
    private readonly candidates;
    constructor(embeddings: Embeddings, args: ElasticClientArgs);
    addDocuments(documents: Document[], options?: {
        ids?: string[];
    }): Promise<string[]>;
    addVectors(vectors: number[][], documents: Document[], options?: {
        ids?: string[];
    }): Promise<string[]>;
    similaritySearchVectorWithScore(query: number[], k: number, filter?: ElasticFilter | undefined): Promise<[Document, number][]>;
    delete(params: {
        ids: string[];
    }): Promise<void>;
    static fromTexts(texts: string[], metadatas: object[] | object, embeddings: Embeddings, args: ElasticClientArgs): Promise<ElasticVectorSearch>;
    static fromDocuments(docs: Document[], embeddings: Embeddings, dbConfig: ElasticClientArgs): Promise<ElasticVectorSearch>;
    static fromExistingIndex(embeddings: Embeddings, dbConfig: ElasticClientArgs): Promise<ElasticVectorSearch>;
    private ensureIndexExists;
    private buildMetadataTerms;
    doesIndexExist(): Promise<boolean>;
    deleteIfExists(): Promise<void>;
}
export {};
