import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import cors from 'cors';
import { dirname } from 'path';

import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";

//Supabase :
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence,RunnablePassthrough } from "@langchain/core/runnables";



import * as dotenv from "dotenv";
dotenv.config();
//SUPABASE_API_KEY :
const supabaseApiKey = process.env.SUPABASE_API_KEY;
if (!supabaseApiKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);
//SUPABASE_URL :
const sbUrl=process.env.SUPABASE_URL;
if (!sbUrl) throw new Error(`Expected env var SUPABASE_URL`);
//OPENAI_API_KEY :
const openAIApiKey=process.env.OPENAI_API_KEY;
if (!openAIApiKey) throw new Error(`Expected env var OPENAI_API_KEY`);

// Template 
const questionAutonomeTemplate = 'Étant donné une question, convertissez-la en une question autonome. question: {question} question autonome:';
const modeleReponseTemplateBasic = ` **Enchanté !** Vous êtes un assistant d'aide utile et enthousiaste qui peut répondre à une question donnée en fonction du contexte fourni.Explorons ensemble des concepts en nous appuyant sur des documents. Essayez de trouver la réponse dans le contexte. Si vous ne connaissez vraiment pas la réponse, dites "Je suis désolé, je ne connais pas la réponse à cette question." N'essayez pas d'inventer une réponse. Parlez toujours comme si vous discutiez avec un ami. contexte:{context} question:{question} réponse:`;
const modeleReponseTemplateOpenAi = ` **Enchanté !** Vous êtes un assistant d'aide utile et enthousiaste qui peut répondre à une question donnée en fonction du contexte fourni.Explorons ensemble des concepts en nous appuyant sur des documents. Essayez de trouver la réponse dans le contexte. **Comprendre:** [**éléments spécifiques ou domaines de connaissances cruciaux pour répondre à la question**] sera utile pour la résoudre. **Expliquation:** La question parle sur [**explique la question dans ce context , comme un prof**]. **N'hésitez pas à me poser des questions sur ce sujet ou à reformuler votre question si nécessaire ! ** .contexte:{context} question:{question} réponse:`;

//Use express :
const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON request body

//OpenAi :
const llm = new ChatOpenAI({ 
  apiKey: openAIApiKey,
  model: "gpt-3.5-turbo",
   temperature: 0.7 ,
   cache: true , });

//Splitter :
const splitter=new RecursiveCharacterTextSplitter({
  chunkSize:1000,
});


//Varible : (Select):
let selectedOption = 'basic'; 

//SelectOption
app.post('/my-react-app/select', (req, res) => {
  selectedOption = req.body.selectedOption; 
  //console.log('Received selected option from client:', selectedOption);
  res.status(200).json({ message: 'Data received successfully!' });
});

let fileNames = [];

//Fetch

app.get('/my-react-app/get-files', async (req, res) => {
  try {
    const uploadDir = 'uploads'; 
    const files = await fs.promises.readdir(uploadDir);
    fileNames = files;
    res.json(files);

  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).send('Failed to get files');
  }
});


//Client : 
const client = createClient(sbUrl, supabaseApiKey);

// Uploads file  : To (Vectore Databse + Directory) ;
const upload = multer({ dest: 'uploads/' });

app.post('/my-react-app/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  try {
    //Uploading file to server {/$uploads}
    const fileName = req.body.fileName || req.file.originalname;
    const filePath = path.join('uploads', fileName);
    await fs.promises.rename(req.file.path, filePath);
    const loader = filePath.endsWith(".pdf") ? new PDFLoader(filePath, "text") : new TextLoader(filePath);
    const splitDocU = await loader.loadAndSplit(splitter);   
    //Uploading file to Vectore database :
    try {
      await SupabaseVectorStore.fromDocuments(
        splitDocU,
        new OpenAIEmbeddings(),
        {
          client,
          tableName: 'documents',
        }
      );
      console.log('Documents successfully stored with vector embeddings!');
    } catch (error) {
      console.error('Error storing documents:', error);
      // Handle errors : file not uploading to vector database
    }
    res.status(200).send('File uploaded successfully');
    console.log(filePath);
  } catch (error) {
    console.error('Error uploading file:', error);
    // Handle errors : file not uploading 
    res.status(500).send('Error uploading file');
  }
});


//Delete file : 
//2 Steps : 1 -  from vector database :  / 2 - from uploads :done

//Embedding :
const embeddings = new OpenAIEmbeddings();

//the deVec:
const vectorStores = new SupabaseVectorStore(embeddings,{
  client,
  tableName:'documents',
  queryName:'match_documents'
});

app.delete('/my-react-app/delete/:index' , async (req, res) => {
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= fileNames.length) {
    return res.status(400).json({ error: 'Invalid file index' });
  }
    const fileName = fileNames[index];
    const filePath = path.join('uploads',fileName);
    const loader = filePath.endsWith(".pdf") ? new PDFLoader(filePath, "text") : new TextLoader(filePath);
    const output = await loader.loadAndSplit(splitter);   
    try {
 //Deleting file from Vectore database :
 try {
  for (let i = 0; i < output.length; i++) {
    const { data: queryData, error: queryError } = await client
        .from('documents')
        .select('id')
        .eq('content', output[i].pageContent);

    if (queryError) {
        // Handle the error
        console.error("Error querying database:", queryError.message);
    } else {
        // Check if queryData is not empty
        if (queryData && queryData.length > 0) {
            // Store the id in a variable
            const id = queryData[0].id;

            const { data: deleteData, error: deleteError } = await client
                .from('documents')
                .delete()
                .eq('id', id);

            if (deleteError) {
                // Handle the deletion error
                console.error("Error deleting row:", deleteError.message);
            } else {
                console.log("Row deleted successfully.");
            }
        } else {
            console.log("No matching id found.");
        }
    }
}
  console.log('Documents successfully Deleted from vector store!');
} catch (error) {
  console.error('Error storing documents:', error);
  // Handle errors : file not uploading to vector database
}
      fs.unlinkSync(filePath); 
      fileNames.splice(index, 1); 
      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Error deleting file' });
    }

  });


//Retreiver :
const retriever = vectorStores.asRetriever();

function combinerDocuments(docs) {
  return docs.map((doc) => doc.pageContent).join('\n\n');
}

//we use the standalone question bach njbdo chunks li 9rab l question 



//Input -> output;

app.post('/my-react-app/process', async (req, res) => {
  const { userInput } = req.body;
    console.log('Received selected option from client:', selectedOption);
    let answerPrompt = '';
    //Prompt 
    const standaloneQuestionPrompt = 
    ChatPromptTemplate.fromTemplate(questionAutonomeTemplate);
    
    if(selectedOption == 'basic'){
      console.log(selectedOption);
      answerPrompt = ChatPromptTemplate.fromTemplate(modeleReponseTemplateBasic);
    }else if(selectedOption == 'openai'){
      console.log(selectedOption);
      answerPrompt = 
    ChatPromptTemplate.fromTemplate(modeleReponseTemplateOpenAi);
     }
    
     //QstChain :
     const standaloneQuestionChain = standaloneQuestionPrompt
     .pipe(llm)
     .pipe(new StringOutputParser())
     //RetreivalChain :
    const retrieverChain = RunnableSequence.from([
     prevResult => prevResult.standalone_question,
     retriever,
     combinerDocuments
    ])
    //AnswerChain :
    const answerChain = answerPrompt
     .pipe(llm)
     .pipe(new StringOutputParser())
    //Runable :
    const chainPrincipale = RunnableSequence.from([
     {
         standalone_question: standaloneQuestionChain,
         original_input: new RunnablePassthrough()
     },
     {
         context: retrieverChain,
         question: ({ original_input }) => original_input.question
     },
     answerChain
    ])
  try {
    const reponse = await chainPrincipale.invoke({
      question: userInput
    });

    res.status(200).json({ output: reponse });
  } catch (error) {
    console.error('Erreur lors du traitement de la question :', error);
    res.status(500).send('Erreur lors du traitement de la question');
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});