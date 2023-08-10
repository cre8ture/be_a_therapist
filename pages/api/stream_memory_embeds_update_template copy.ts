import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'


import { OpenAI } from "langchain/llms/openai";
import { ConversationSummaryMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// const model = new OpenAI({ openAIApiKey: "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", modelName: "gpt-3.5-turbo", temperature: 0.5, streaming: true })
const model = new OpenAI({ openAIApiKey: OPENAI_API_KEY, modelName: "gpt-3.5-turbo", temperature: 0.5, streaming: true })


const memory = new ConversationSummaryMemory({
  memoryKey: "history",
  llm: model,
});

const prompt1 = `
You are the famous therapist `
let person = "Sigmund Freud" 


const prompt2 = `. First, introducing yourself, describing briefly the key beliefs of your therapy form.  You are in a therapy session with a client. Respond only as yourself using the linguistic behaviors your are known for throughout history. Use only the therapy form you've developed.
The following is the conversation so far between you and a client:
Current conversation:
{history}
Human: {input}
AI:`;

var prompt_new = prompt1 +  person + prompt2




let prompt =
  PromptTemplate.fromTemplate(prompt_new);
var chain = new LLMChain({ llm: model, prompt, memory });


prompt.format({ person:"Sigmund Freud"})




// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

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

 
// prompt.format({ person: req.body.person})
      person = req.body.person
      prompt_new = prompt1 +  person + prompt2
      let prompt =
      PromptTemplate.fromTemplate(prompt_new);
      chain.prompt = prompt // = new LLMChain({ llm: model, prompt, memory });

    }

    if(req.body.reset){
      console.log("we are resetting")
      memory.clear()
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

}
