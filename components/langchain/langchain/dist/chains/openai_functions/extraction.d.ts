import { z } from "zod";
import { ChatOpenAI } from "../../chat_models/openai.js";
import { FunctionParameters } from "../../output_parsers/openai_functions.js";
import { LLMChain } from "../llm_chain.js";
export declare function createExtractionChain(schema: FunctionParameters, llm: ChatOpenAI): LLMChain<object, ChatOpenAI>;
export declare function createExtractionChainFromZod(schema: z.ZodObject<any, any, any, any>, llm: ChatOpenAI): LLMChain<object, ChatOpenAI>;
