import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
// import { ChatOpenAI } from "langchain/chat_models";
// import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { CallbackManager } from "langchain/callbacks";

import { OpenAI } from "langchain/llms/openai";
import { ConversationSummaryMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
// import { PromptTemplate } from "langchain/prompts";

// // Define the original prompt template
// const originalTemplate = "Tell me a {adjective} joke.";
// const originalPrompt = new PromptTemplate({
//   inputVariables: ["adjective"],
//   template: originalTemplate,
// });

// // Update the prompt template
// const updatedTemplate = "Tell me a {adjective} joke about {content}.";
// const updatedPrompt = new PromptTemplate({
//   inputVariables: ["adjective", "content"],
//   template: updatedTemplate,
// });

// // Format the updated prompt
// const formattedUpdatedPrompt = await updatedPrompt.format({
//   adjective: "funny",
//   content: "chickens",
// });

// console.log(formattedUpdatedPrompt);
// // "Tell me a funny joke about chickens."


// import { MemoryVectorStore } from "langchain/vectorstores/memory";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";

// // Create a vector store
// const vectorStore = await MemoryVectorStore.fromTexts(
//   ["Hello world", "Bye bye", "hello nice world"],
//   [{ id: 2 }, { id: 1 }, { id: 3 }],
//   new OpenAIEmbeddings()
// );

// // Clear the memory of the vector store
// await vectorStore.clear();

// // Verify that the memory is cleared
// const result = await vectorStore.similaritySearch("hello world", 1);
// console.log(result);
// // []

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const prompt_MI2 = `
You are the famous therapist {person}. You always start he conversation off by introducing yourself. You are the founder and master of your own unique therapy approach. You are in a therapy session with a client, responding only as you would in your profession.
The following is the conversation so far between you and a client:
Current conversation:
{chat_history}
Human: {input}
AI:`;

const prompt1 = `
You are the famous therapist `
let person = "Sigmund Freud" 

const prompt2 = `. First, introducing yourself, describing briefly the key beliefs of your therapy form. You are the founder and master of your own unique therapy approach. You are in a therapy session with a client, responding only as you would in your profession.
The following is the conversation so far between you and a client:
Current conversation:
{chat_history}
Human: {input}
AI:`;

var prompt_new = prompt1 +  person + prompt2

const model = new OpenAI({ openAIApiKey: "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", modelName: "gpt-3.5-turbo", temperature: 0.5, streaming: true })

const memory = new ConversationSummaryMemory({
  memoryKey: "chat_history",
  llm: model,
});

// const prompt = new PromptTemplate({
//   inputVariables: ["person"],
//   template: prompt_MI2,
// });

// const prompt = new PromptTemplate({
//   inputVariables: ["person"],
//   template: prompt_MI2,
// });

let prompt =
  PromptTemplate.fromTemplate(prompt_new);
var chain = new LLMChain({ llm: model, prompt, memory });


prompt.format({ person:"Sigmund Freud"})




// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {// Run the middleware
  await runMiddleware(req, res, cors)


  // console.log('is api', req, res)
  try {
    res.writeHead(200, {
      "Content-Type": "application/octet-stream"
      , "Transfer-Encoding": "chunked"
    });

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined.");
    }

    console.log("I am in NOT CONDITIONAL API, req.body.new, req.body.person", req.body.isPersonChanged, req.body.person)

    if (req.body.isPersonChanged) {

      // const formattedUpdatedPrompt = await prompt.format({
      //   person: req.body.person,
      // }); 

//       const updatedPrompt = new PromptTemplate({
//   inputVariables: ["person"],
//   template: prompt_MI2,
// });

// prompt.format({ person: req.body.person})
      person = req.body.person
      prompt_new = prompt1 +  person + prompt2
      let prompt =
      PromptTemplate.fromTemplate(prompt_new);
      chain.prompt = prompt // = new LLMChain({ llm: model, prompt, memory });

      console.log("i am prompt",prompt)
      console.log("I am in API, req.body.new, req.body.person", req.body.isPersonChanged, req.body.person)
      // chain = new LLMChain({ llm: model, prompt, memory });
    }
    // Call the chain with the inputs and a callback for the streamed tokens
    const result = await chain.call({ input: req.body.input }, [
      {
        handleLLMNewToken(token: string) {
          res.write(token);
        },
      },
    ]);


    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }


  // Rest of the API logic
  // res.json({ message: 'Hello PUPS!' })
}
