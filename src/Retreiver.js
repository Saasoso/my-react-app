import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
///Document here
const path = "./uploads/suicide.pdf"; 
const chatModel = new ChatOpenAI({
  apiKey: "OPENAI_API_KEY",
    model: "gpt-3.5-turbo",
    temperature: 0.5
  });
const splitter = new RecursiveCharacterTextSplitter();
  const loader = path.endsWith(".pdf") ? new PDFLoader(path, "text") : new TextLoader(path);
  const splitDocs = await loader.loadAndSplit(splitter);


console.log(splitDocs.length);
console.log(splitDocs[0].pageContent.length);



import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const prompt = ChatPromptTemplate.fromTemplate(`**Hey there!** I'm Chat, your friendly AI assistant. Let's explore some concepts together.

**Here's some background information to help you understand:**

<context>
{context}
</context>

**Now, let's get to the question!**

**Question:** {input}

**Explanation:** 

This question is asking about [**explain the key concepts or focus of the question**]. Understanding [**mention specific elements or areas of knowledge crucial for answering the question**] will be helpful in solving it.

**Feel free to ask me anything related to this topic or rephrase the question if needed!**
`);


const documentChain = await createStuffDocumentsChain({
    llm: chatModel,
    prompt,
  });
  import { Document } from "@langchain/core/documents";
/////Input here


  const output = 
    await documentChain.invoke({
      input: "I hate my life",
      context: [
        new Document({
          pageContent:
          "You are a world class Teacher.",
        }),
      ],
    });
console.log(output);


