import { Embeddings } from "./base.js";
import { GoogleVertexAIConnection } from "../util/googlevertexai-connection.js";
import { chunkArray } from "../util/chunk.js";
/**
 * Enables calls to the Google Cloud's Vertex AI API to access
 * the embeddings generated by Large Language Models.
 *
 * To use, you will need to have one of the following authentication
 * methods in place:
 * - You are logged into an account permitted to the Google Cloud project
 *   using Vertex AI.
 * - You are running this on a machine using a service account permitted to
 *   the Google Cloud project using Vertex AI.
 * - The `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set to the
 *   path of a credentials file for a service account permitted to the
 *   Google Cloud project using Vertex AI.
 */
export class GoogleVertexAIEmbeddings extends Embeddings {
    constructor(fields) {
        super(fields ?? {});
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "textembedding-gecko"
        });
        Object.defineProperty(this, "connection", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.model = fields?.model ?? this.model;
        this.connection = new GoogleVertexAIConnection({ ...fields, ...this }, this.caller);
    }
    async embedDocuments(documents) {
        const instanceChunks = chunkArray(documents.map((document) => ({
            content: document,
        })), 5); // Vertex AI accepts max 5 instnaces per prediction
        const parameters = {};
        const options = {};
        const responses = await Promise.all(instanceChunks.map((instances) => this.connection.request(instances, parameters, options)));
        const result = responses
            ?.map((response) => response.data?.predictions?.map((result) => result.embeddings.values) ?? [])
            .flat() ?? [];
        return result;
    }
    async embedQuery(document) {
        const data = await this.embedDocuments([document]);
        return data[0];
    }
}