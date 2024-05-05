import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON request body

//Varible : (Select / Input) :
let selectedOption = ''; 

//SelectOption
app.post('my-react-app/select', (req, res) => {
  selectedOption = req.body.selectedOption; 
  console.log('Received selected option from client:', selectedOption);
  res.status(200).json({ message: 'Data received successfully!' });
});

//Input


const upload = multer({ dest: 'uploads/' });

app.post('my-react-app/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const fileName = req.body.fileName || req.file.originalname;
    const filePath = path.join('uploads', fileName);
    await fs.promises.rename(req.file.path, filePath);
    res.status(200).send('File uploaded successfully');
    console.log(filePath);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
});
let prompt ; 
app.post('my-react-app/process', async (req, res) => {

  const { userInput} = req.body;
  const basic = 'basic';
  const openai = 'openai';
  try {
    const memory = new ConversationSummaryMemory({
      memoryKey: "chat_history",
      llm: new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 }),
    });

    const chatModel = new ChatOpenAI({ 
    apiKey: "sk-proj-sM4JRxNhHRHMUcvc6p7lT3BlbkFJU6ZHUPGQl2pUXJqPghpC",
    model: "gpt-3.5-turbo",
     temperature: 0.7 ,
     cache: true , });
    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
      chunkSize: 1000,
      chunkOverlap: 0,
    });
    let prompt ; 
    const loader = filePath.endsWith(".pdf") ? new PDFLoader(filePath, "text") : new TextLoader(filePath);
    const splitDocs = await loader.loadAndSplit(splitter);

    const context = [new Document({ pageContent: splitDocs.map(doc => doc.pageContent).join(' ') })];

    if(selectedOption == basic){
       prompt = ChatPromptTemplate.fromTemplate(
        `**Enchanté !** Je suis PFEChat, votre assistant IA convivial. Explorons ensemble des concepts en nous appuyant sur des documents.
        **Voici quelques informations contextuelles pour vous aider à comprendre:** <context> {context} </context> 
        Current conversation: {chat_history}
        **Maintenant, passons à la question !** **Question:** {input} 
        **Hmm, voyons voir...**
        **(Si le contexte fournit les connaissances pour répondre à la question):**
        **Expliquation:** La question parle sur [**explique la question dans ce context , comme un professeur des etudes superieures**].
        **Comprendre:** [**éléments spécifiques ou domaines de connaissances cruciaux pour répondre à la question**] sera utile pour la résoudre. 
        **N'hésitez pas à me poser des questions sur ce sujet ou à reformuler votre question si nécessaire ! **
        **(Si le contexte ne fournit pas suffisamment de connaissances):**
        [** Hmm, il semble que les informations contextuelles ne permettent pas de répondre directement à votre question. Mais ne vous inquiétez pas !
        Peut-être pourriez-vous reformuler votre question ou fournir plus de détails, et je pourrais alors vous aider.**]`);
    }else if(selectedOption == openai){
       prompt = ChatPromptTemplate.fromTemplate(
        `**Enchanté !** Je suis PFEChat, votre assistant IA convivial. Explorons ensemble des concepts en nous appuyant sur des documents.
        **Voici quelques informations contextuelles pour vous aider à comprendre:** <context> {context} </context> 
        Current conversation: {chat_history}
        **Maintenant, passons à la question !** **Question:** {input} 
        **Comprendre:** [**éléments spécifiques ou domaines de connaissances cruciaux pour répondre à la question**] sera utile pour la résoudre.  
        **Expliquation:** La question parle sur [**explique la question dans ce context , comme un professeur des etudes superieures**].
        **N'hésitez pas à me poser des questions sur ce sujet ou à reformuler votre question si nécessaire ! **`);
      }
    const documentChain = await createStuffDocumentsChain({ llm: chatModel, prompt, memory });
    const output = await documentChain.invoke({ input: userInput, context });
    console.log(userInput);
    console.log({ output, memory: await memory.loadMemoryVariables({}) });
    res.status(200).json({ output });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});