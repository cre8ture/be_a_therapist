import PQueueMod from "p-queue";
import { Client } from "langchainplus-sdk";
import { LangChainTracer } from "../callbacks/handlers/tracer_langchain.js";
import { mapStoredMessagesToChatMessages } from "../stores/message/utils.js";
const stringifyError = (err) => {
    let result;
    if (err == null) {
        result = "Error null or undefined";
    }
    else {
        const error = err;
        result = `Error: ${error?.name}: ${error?.message}`;
    }
    return result;
};
export function isLLM(llm) {
    const blm = llm;
    return (typeof blm?._modelType === "function" && blm?._modelType() === "base_llm");
}
export function isChatModel(llm) {
    const blm = llm;
    return (typeof blm?._modelType === "function" &&
        blm?._modelType() === "base_chat_model");
}
export async function isChain(llm) {
    if (isLLM(llm)) {
        return false;
    }
    const bchFactory = llm;
    const bch = await bchFactory();
    return (typeof bch?._chainType === "function" && bch?._chainType() !== undefined);
}
async function getModelOrFactoryType(llm) {
    if (isLLM(llm)) {
        return "llm";
    }
    if (isChatModel(llm)) {
        return "chatModel";
    }
    const bchFactory = llm;
    const bch = await bchFactory();
    if (typeof bch?._chainType === "function") {
        return "chainFactory";
    }
    throw new Error("Unknown model or factory type");
}
const runLLM = async (example, tracer, llm) => {
    try {
        const prompt = example.inputs.prompt;
        return await llm.generate([prompt], undefined, [tracer]);
    }
    catch (e) {
        console.error(e);
        return stringifyError(e);
    }
};
const runChain = async (example, tracer, chainFactory) => {
    try {
        const chain = await chainFactory();
        return await chain.call(example.inputs, [tracer]);
    }
    catch (e) {
        console.error(e);
        return stringifyError(e);
    }
};
const runChatModel = async (example, tracer, chatModel) => {
    try {
        const messages = example.inputs.messages;
        return await chatModel.generate([mapStoredMessagesToChatMessages(messages)], undefined, [tracer]);
    }
    catch (e) {
        console.error(e);
        return stringifyError(e);
    }
};
export const runOnDataset = async (datasetName, llmOrChainFactory, { maxConcurrency = 8, numRepetitions = 1, projectName, client, } = {}) => {
    const PQueue = "default" in PQueueMod ? PQueueMod.default : PQueueMod;
    const queue = new PQueue({ concurrency: maxConcurrency });
    const client_ = client ?? new Client({});
    const examples = await client_.listExamples({ datasetName });
    let projectName_;
    if (projectName === undefined) {
        const currentTime = new Date().toISOString();
        projectName_ = `${datasetName}-${typeof llmOrChainFactory === "function"
            ? ""
            : llmOrChainFactory.constructor.name}-${currentTime}`;
    }
    else {
        projectName_ = projectName;
    }
    await client_.createProject({ projectName: projectName_, mode: "eval" });
    const results = examples.reduce((acc, example) => ({ ...acc, [example.id]: [] }), {});
    const modelOrFactoryType = await getModelOrFactoryType(llmOrChainFactory);
    await Promise.all(Array.from({ length: numRepetitions })
        .flatMap(() => examples)
        .map(async (example) => {
        const tracer = new LangChainTracer({
            exampleId: example.id,
            projectName: projectName_,
        });
        if (modelOrFactoryType === "llm") {
            const llm = llmOrChainFactory;
            const llmResult = await queue.add(() => runLLM(example, tracer, llm), { throwOnTimeout: true });
            results[example.id].push(llmResult);
        }
        else if (modelOrFactoryType === "chainFactory") {
            const chainFactory = llmOrChainFactory;
            const chainResult = await queue.add(() => runChain(example, tracer, chainFactory), { throwOnTimeout: true });
            results[example.id].push(chainResult);
        }
        else if (modelOrFactoryType === "chatModel") {
            const chatModel = llmOrChainFactory;
            const chatModelResult = await queue.add(() => runChatModel(example, tracer, chatModel), { throwOnTimeout: true });
            results[example.id].push(chatModelResult);
        }
        else {
            throw new Error(` llm or chain type: ${llmOrChainFactory}`);
        }
    }));
    return results;
};
