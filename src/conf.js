import { ChatOpenAI } from "@langchain/openai";
const chatModel = new ChatOpenAI({
  apiKey: "OPENAI_API_KEY",
    model: "gpt-3.5-turbo",
  temperature: 0.5
});

import { ConversationChain } from "langchain/chains";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { BufferMemory } from "langchain/memory";


const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know."
  ),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

const chain = new ConversationChain({
  memory: new BufferMemory({ returnMessages: true, memoryKey: "history" }),
  prompt: chatPrompt,
  llm: chatModel,
});

const response = await chain.call({
  input: "Howto upload file using langachani",
});
console.log(response);
const response2 = await chain.call({
  input: "In a minute?",
});

console.log(response2);