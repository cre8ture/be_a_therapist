import { BaseLLM } from "./base.js";
import { GoogleVertexAIConnection } from "../util/googlevertexai-connection.js";
/**
 * Enables calls to the Google Cloud's Vertex AI API to access
 * Large Language Models.
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
export class GoogleVertexAI extends BaseLLM {
    constructor(fields) {
        super(fields ?? {});
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "text-bison"
        });
        Object.defineProperty(this, "temperature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.7
        });
        Object.defineProperty(this, "maxOutputTokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1024
        });
        Object.defineProperty(this, "topP", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.8
        });
        Object.defineProperty(this, "topK", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 40
        });
        Object.defineProperty(this, "connection", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.model = fields?.model ?? this.model;
        // Change the defaults for code models
        if (this.model === "code-gecko") {
            this.maxOutputTokens = 64;
        }
        if (this.model.startsWith("code-")) {
            this.temperature = 0.2;
        }
        this.temperature = fields?.temperature ?? this.temperature;
        this.maxOutputTokens = fields?.maxOutputTokens ?? this.maxOutputTokens;
        this.topP = fields?.topP ?? this.topP;
        this.topK = fields?.topK ?? this.topK;
        this.connection = new GoogleVertexAIConnection({ ...fields, ...this }, this.caller);
    }
    _llmType() {
        return "googlevertexai";
    }
    async _generate(prompts, options) {
        const generations = await Promise.all(prompts.map((prompt) => this._generatePrompt(prompt, options)));
        return { generations };
    }
    async _generatePrompt(prompt, options) {
        const instance = this.formatInstance(prompt);
        const parameters = {
            temperature: this.temperature,
            topK: this.topK,
            topP: this.topP,
            maxOutputTokens: this.maxOutputTokens,
        };
        const result = await this.connection.request([instance], parameters, options);
        const prediction = this.extractPredictionFromResponse(result);
        return [
            {
                text: prediction.content,
                generationInfo: prediction,
            },
        ];
    }
    formatInstanceText(prompt) {
        return { content: prompt };
    }
    formatInstanceCode(prompt) {
        return { prefix: prompt };
    }
    formatInstance(prompt) {
        return this.model.startsWith("code-")
            ? this.formatInstanceCode(prompt)
            : this.formatInstanceText(prompt);
    }
    extractPredictionFromResponse(result) {
        return result?.data?.predictions[0];
    }
}
