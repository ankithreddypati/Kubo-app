import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { promises as fs } from "fs";
import connectDB from './db.js';
import FormData from 'form-data';
import https from 'https';
import axios from 'axios';
import { WebSocketServer } from 'ws';
import http from 'http';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import Conversation from './models/Conversation.js';
import { createAuthenticationTool } from "./tools/authTool.js";
import {createProductDetectionTool} from "./tools/productDetectTool.js"
import {createproductTroubleshootingTool} from './tools/productTshootTool.js'
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";

dotenv.config();

let agentExecutor = null;

const getModelClient = (modelType = 'openai') => {
  let modelOptions = {
    modelName: "gpt-4o",
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.6,
  };

  if (modelType === 'qwen') {
    modelOptions = {
      modelName: "qwen",
      baseURL: "https://llmserver-ankithreddy137-dev.apps.cluster.intel.sandbox1234.opentlc.com/codeserver/proxy/8080/",
      apiKey: "sk-no-key-required",
      temperature: 0.6,
      defaultHeaders: {
        "Content-Type": "application/json",
      },
    };
  }

  return new ChatOpenAI(modelOptions);
};

// Initialize agent
const initializeAgent = async (modelType = 'openai') => {
  if (agentExecutor) {
    return agentExecutor;
  }

  const model = getModelClient(modelType);

  const prompt = ChatPromptTemplate.fromMessages([
    ("system", "You are an AI customer care agent for Kubo, an innovative retail company selling tech. Remember to Always reply with a JSON array of messages, each containing 'text', 'facialExpression', and 'animation'. Expressions: smile, sad, angrysmirk, surprised, concerned, confused, curious, angry, crazy, default. Animations: Talking1, Talking2, NodThinking, NodYes, SalsaDance, Thanking, Laughing, Thinking, Idle, Waving, Waving1. "),
    ("human", "{input}"),
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const authTool = createAuthenticationTool();
  const productDetectionTool = createProductDetectionTool();
  const productTroubleshootingTool = createproductTroubleshootingTool();

  // const projectDocumentationTool = createprojectDocumentationTool();

  const tools = [authTool, productDetectionTool];

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    prompt,
    tools,
  });

  agentExecutor = new AgentExecutor({
    agent,
    tools,
  });

  return agentExecutor;
};

const outputParser = new JsonOutputParser({
  schema: z.array(
    z.object({
      text: z.string(),
      facialExpression: z.enum([
        "smile", "sad", "angrysmirk", "surprised", "concerned", 
        "confused", "curious", "angry", "crazy", "default"
      ]),
      animation: z.enum([
        "Talking1", "Talking2", "NodThinking", "NodYes", "SalsaDance",
        "Thanking", "Laughing", "Thinking", "Idle", "Waving", "Waving1"
      ])
    })
  )
});

// Express setup
const app = express();
connectDB();
app.use(express.json());
app.use(cors({
  origin: ['https://vite-frontend-route-ankithreddy137-dev.apps.cluster.intel.sandbox1234.opentlc.com', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
}));
const port = 3000;

// Create HTTP server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const handleLLMInteraction = async (message, chat_history = []) => {
  try {
    console.log('\n=== Starting new interaction ===');
    console.log('User message:', message);

    const agent = await initializeAgent();
    const agentResponse = await agent.invoke({
      input: message,
      chat_history,
    });

    let response;
    try {
        response = outputParser.parse(agentResponse.output);

      return response

    } catch (parseError) {
      console.error('Parser error:', parseError);
      // Provide a properly formatted fallback response
      response = [{
        text: agentResponse.output || "I understand your message but had trouble formatting my response.",
        facialExpression: "concerned",
        animation: "Thinking"
      }];
    }
    console.log('\nAgent response:', JSON.stringify(response, null, 2));
    return response;

  } catch (error) {
    console.error('\n=== Error in LLM interaction ===');
    console.error('Error details:', error.response?.data || error.message);
    return [{
      text: "I apologize, but I encountered an error. Please try again.",
      facialExpression: "sad",
      animation: "Talking1",
    }];
  }
};

const processMessagesWithAudio = async (messages, ttsConfig = {
  language: "EN",
  accent: "EN-BR",
  speed: 1.2
}) => {
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const audioFile = `audios/message_${i}.wav`;

    try {
      const response = await axios.post(process.env.MELOTTS_URL, {
        text: message.text,
        language: ttsConfig.language,
        accent: ttsConfig.accent,
        speed: ttsConfig.speed
      }, {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      await fs.writeFile(audioFile, Buffer.from(response.data));
      
      await lipSyncMessage(i, audioFile);
      message.audio = await audioFileToBase64(audioFile);
      message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
    } catch (error) {
      console.error('MeloTTS error:', error);
      throw error;
    }
  }
  return messages;
};

// WebSocket connection handler
wss.on('connection', async (ws) => {
  console.log('New client connected');
  let currentConversation = null;
  let isProcessing = false;
  const chat_history = [];

  try {
    await initializeAgent();
    currentConversation = await Conversation.create({});
    console.log(`New conversation started: ${currentConversation._id}`);

    ws.send(JSON.stringify({
      conversationId: currentConversation._id,
      messages: []
    }));

  } catch (error) {
    console.error('Error creating conversation:', error);
    ws.send(JSON.stringify({
      error: 'Failed to start conversation',
      details: error.message
    }));
    ws.close();
    return;
  }

  ws.on('message', async (data) => {
    if (isProcessing) {
      console.log('Already processing a message, skipping...');
      return;
    }

    try {
      const messageData = JSON.parse(data);
      isProcessing = true;

      switch (messageData.type) {
        case 'authenticate':
          try {
            const agentResponse = await agentExecutor.invoke({
              input: `Authenticate customer with phone ending in ${messageData.phoneLastFour} and zip code ${messageData.zipCode}`,
              chat_history,
            });

            const authResult = JSON.parse(agentResponse.output);
            
            if (authResult.success) {
              await Conversation.findByIdAndUpdate(
                currentConversation._id,
                { 
                  customerId: authResult.customerId,
                  $push: {
                    chatHistory: {
                      role: 'system',
                      content: `Customer authenticated: ${authResult.name}`,
                      timestamp: new Date(),
                      metadata: {
                        event: 'authentication',
                        success: true
                      }
                    }
                  }
                }
              );
              
              chat_history.push(new HumanMessage(`Authentication request for ${authResult.name}`));
              chat_history.push(new AIMessage(authResult.message));
            } else {
              await Conversation.findByIdAndUpdate(
                currentConversation._id,
                {
                  $push: {
                    chatHistory: {
                      role: 'system',
                      content: 'Authentication failed',
                      timestamp: new Date(),
                      metadata: {
                        event: 'authentication',
                        success: false
                      }
                    }
                  }
                }
              );
            }

            const messages = [{
              text: authResult.message,
              facialExpression: authResult.facialExpression,
              animation: authResult.animation
            }];

            const processedMessages = await processMessagesWithAudio(messages);
            ws.send(JSON.stringify({ 
              type: 'auth_response',
              ...authResult,
              messages: processedMessages
            }));

          } catch (error) {
            console.error('Authentication error:', error);
            ws.send(JSON.stringify({
              type: 'auth_response',
              success: false,
              messages: [{
                text: "Authentication error occurred. Please try again.",
                facialExpression: "sad",
                animation: "Talking1"
              }]
            }));
          }
          break;

        case 'audio':
          try {
            const text = messageData.transcription;
            if (!text) {
              isProcessing = false;
              return;
            }
            
            console.log('Received transcription:', text);
            chat_history.push(new HumanMessage(text));
            
            await Conversation.findByIdAndUpdate(
              currentConversation._id,
              {
                $push: {
                  chatHistory: {
                    role: 'user',
                    content: text,
                    type: 'audio',
                    timestamp: messageData.timestamp
                  }
                }
              }
            );

            const messages = await handleLLMInteraction(text, chat_history);
            
            for (const message of messages) {
              await Conversation.findByIdAndUpdate(
                currentConversation._id,
                {
                  $push: {
                    chatHistory: {
                      role: 'assistant',
                      content: message.text,
                      metadata: {
                        facialExpression: message.facialExpression,
                        animation: message.animation,
                        timestamp: Date.now()
                      }
                    }
                  }
                }
              );
            }

            chat_history.push(new AIMessage(messages[0].text));
            const processedMessages = await processMessagesWithAudio(messages);
            ws.send(JSON.stringify({ messages: processedMessages }));
            
          } catch (error) {
            console.error('Speech processing error:', error);
            ws.send(JSON.stringify({
              error: 'Failed to process speech',
              messages: [{
                text: "I'm sorry, but I encountered an error processing your speech. Please try again.",
                facialExpression: "sad",
                animation: "Talking1"
              }]
            }));
          }
          break;

        case 'chat':
          try {
            chat_history.push(new HumanMessage(messageData.message));
            
            await Conversation.findByIdAndUpdate(
              currentConversation._id,
              {
                $push: {
                  chatHistory: {
                    role: 'user',
                    content: messageData.message,
                    type: 'text',
                    timestamp: messageData.timestamp
                  }
                }
              }
            );

            const messages = await handleLLMInteraction(messageData.message, chat_history);

            for (const message of messages) {
              await Conversation.findByIdAndUpdate(
                currentConversation._id,
                {
                  $push: {
                    chatHistory: {
                      role: 'assistant',
                      content: message.text,
                      metadata: {
                        facialExpression: message.facialExpression,
                        animation: message.animation,
                        timestamp: Date.now()
                      }
                    }
                  }
                }
              );
            }

            chat_history.push(new AIMessage(messages[0].text));
            const processedMessages = await processMessagesWithAudio(messages);
            ws.send(JSON.stringify({ messages: processedMessages }));
          } catch (error) {
            console.error('Error in chat processing:', error);
            await Conversation.findByIdAndUpdate(
              currentConversation._id,
              {
                $push: {
                  chatHistory: {
                    role: 'system',
                    content: 'Error in chat processing: ' + error.message,
                    timestamp: Date.now()
                  }
                }
              }
            );
            ws.send(JSON.stringify({
              error: 'Failed to process chat',
              messages: [{
                text: "I'm sorry, but I encountered an error. Please try again.",
                facialExpression: "sad",
                animation: "Talking1"
              }]
            }));
          }
          break;

        case 'audioComplete':
          console.log('Response audio playback complete');
          break;

        default:
          console.log('Unknown message type:', messageData.type);
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({
        messages: [{
          text: "I'm sorry, but I encountered an error. Please try again.",
          facialExpression: "sad",
          animation: "Talking1"
        }]
      }));
    } finally {
      isProcessing = false;
    }
  });

  ws.on('close', async () => {
    console.log('Client disconnected');
    if (currentConversation) {
      try {
        await Conversation.findByIdAndUpdate(
          currentConversation._id,
          {
            status: 'closed',
            endTime: new Date()
          }
        );
        console.log(`Closed conversation: ${currentConversation._id}`);
      } catch (error) {
        console.error('Error closing conversation:', error);
      }
    }
  });
});

// Helper functions for file operations
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message, audioFile) => {
  const time = new Date().getTime();
  console.log(`Starting lipsync for message ${message}`);
  
  try {
    const formData = new FormData();
    formData.append('file', await fs.readFile(audioFile), {
      filename: `message_${message}.wav`,
      contentType: 'audio/wav'
    });

    const headers = {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${process.env.MODEL_SERVER_AUTH_TOKEN}`,
    };

    const response = await axios.post(process.env.LIPSYNC_MODEL_URL, formData, {
      headers: headers,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    await fs.writeFile(
      `audios/message_${message}.json`,
      JSON.stringify(response.data, null, 2)
    );

    console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
    return response.data;
  } catch (error) {
    console.error('Error in lipSyncMessage:', error);
    throw error;
  }
};

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

// Basic routes
app.get("/", (req, res) => {
  res.send("Kubo AI Avatar CRM Backend is running!");
});

// Start server
server.listen(port, () => {
  console.log(`KuboCX backend listening on port ${port}`);
});

































// const handleLLMInteraction = async (message, modelType = 'openai', history = [], conversationId) => {
//   const model = getModelClient(modelType);

//   try {
//     const prompt = ChatPromptTemplate.fromTemplate(`
//       You are an AI customer care agent for Kubo, an innovative retail company selling tech.
//       Always reply with a JSON array of messages, each containing 'text', 'facialExpression', and 'animation'.
//       Expressions: smile, sad, angrysmirk, surprised, concerned, confused, curious, angry, crazy, default.
//       Animations: Talking1, Talking2, NodThinking, NodYes, SalsaDance, Thanking, Laughing, Thinking, Idle, Waving, Waving1.
//       {user_message}
//     `);

//     const chain = prompt.pipe(model).pipe(outputParser);

//     const response = await chain.invoke({
//       user_message: message
//     });

//     console.log("LLM response:", response);
//     return response;

//   } catch (error) {
//     console.error("LLM interaction error:", error);
//     return [{
//       text: "I apologize, but I encountered an error. Please try again.",
//       facialExpression: "sad",
//       animation: "Talking1",
//     }];
//   }
// };




// const handleLLMInteraction = async (message, modelType = 'openai', conversationId) => {
//   const model = getModelClient(modelType);

//   try {
//     console.log('\n=== Starting new interaction ===');
//     console.log('User message:', message);
//     console.log('Conversation ID:', conversationId);

//     // 1. Store user message in vector DB
//     console.log('\n1. Storing user message...');
//     try {
//       const userStoreResponse = await axios.post(`${process.env.BINARY_VECTOR_SERVICE_URL}/vectorize-and-store`, {
//         conversationId: conversationId,  // Keep using conversationId to match both DB and Flask
//         messages: [{
//           content: message,
//           role: 'user',
//           type: 'text',
//           metadata: {},
//           timestamp: new Date().toISOString()
//         }]
//       });
//       console.log('User message vectorization success:', userStoreResponse.data);
//     } catch (vectorError) {
//       console.warn('Vector storage failed but continuing with interaction:', vectorError.message);
//     }

//     // 2. Get relevant context
//     let contextString = '';
//     try {
//       console.log('\n2. Retrieving relevant context...');
//       const contextResponse = await axios.post(`${process.env.BINARY_VECTOR_SERVICE_URL}/get-relevant-context`, {
//         conversationId: conversationId,  // Keep using conversationId to match both DB and Flask
//         query: message,
//         max_results: 3
//       });

//       const relevantMessages = contextResponse.data.relevant_messages;
//       console.log(`Found ${relevantMessages.length} relevant messages`);

//       // Rest of the context processing remains the same
//       const relevantExchanges = [];
//       for(let i = 0; i < relevantMessages.length; i++) {
//         const msg = relevantMessages[i];
//         if(msg.role === 'user' && msg.similarity_score >= 0.7) {
//           console.log(`\nRelevant exchange found (score: ${msg.similarity_score}):`);
//           console.log('User:', msg.content);
          
//           const assistantResponse = relevantMessages[i + 1];
//           if(assistantResponse?.role === 'assistant') {
//             console.log('Assistant:', assistantResponse.content);
//             relevantExchanges.push({
//               query: msg.content,
//               response: assistantResponse.content
//             });
//           }
//         }
//       }

//       if(relevantExchanges.length > 0) {
//         contextString = '\nRelevant past conversations:\n' + 
//           relevantExchanges.map(ex => 
//             `Customer: ${ex.query}\nAgent: ${ex.response}`
//           ).join('\n\n');
//         console.log('\nAdding context to prompt:', contextString);
//       } else {
//         console.log('No relevant context found');
//       }
//     } catch (contextError) {
//       console.warn('Context retrieval failed but continuing:', contextError.message);
//     }

//     // 3. LLM processing remains the same
//     console.log('\n3. Creating prompt and getting LLM response...');
//     const prompt = ChatPromptTemplate.fromTemplate(`
//       You are an AI customer care agent for Kubo, an innovative retail company selling tech.
//       This is the context from previous converstations use only if you need ${contextString}
//       Always reply with a JSON array of messages, each containing 'text', 'facialExpression', and 'animation'.
//       Expressions: smile, sad, angrysmirk, surprised, concerned, confused, curious, angry, crazy, default.
//       Animations: Talking1, Talking2, NodThinking, NodYes, SalsaDance, Thanking, Laughing, Thinking, Idle, Waving, Waving1.
//       {user_message}
//     `);

//     const chain = prompt.pipe(model).pipe(outputParser);
//     const response = await chain.invoke({
//       user_message: message
//     });

//     console.log('\nLLM response:', JSON.stringify(response, null, 2));

//     // 4. Store assistant's response
//     try {
//       console.log('\n4. Storing assistant response...');
//       const assistantStoreResponse = await axios.post(`${process.env.BINARY_VECTOR_SERVICE_URL}/vectorize-and-store`, {
//         conversationId: conversationId,  // Keep using conversationId to match both DB and Flask
//         messages: response.map(msg => ({
//           content: msg.text,
//           role: 'assistant',
//           type: 'text',
//           metadata: {
//             facialExpression: msg.facialExpression,
//             animation: msg.animation
//           },
//           timestamp: new Date().toISOString()
//         }))
//       });
//       console.log('Assistant response vectorization success:', assistantStoreResponse.data);
//     } catch (vectorError) {
//       console.warn('Failed to store assistant response but continuing:', vectorError.message);
//     }

//     return response;

//   } catch (error) {
//     console.error('\n=== Error in LLM interaction ===');
//     console.error('Error details:', error.response?.data || error.message);
//     return [{
//       text: "I apologize, but I encountered an error. Please try again.",
//       facialExpression: "sad",
//       animation: "Talking1",
//     }];
//   }
// };

// const processMessagesWithAudio = async (messages, ttsConfig = {
//   language: "EN",
//   accent: "EN-BR",
//   speed: 1.2
// }) => {
//   for (let i = 0; i < messages.length; i++) {
//     const message = messages[i];
//     const audioFile = `audios/message_${i}.wav`;

//     try {
//       const response = await axios.post(process.env.MELOTTS_URL, {
//         text: message.text,
//         language: ttsConfig.language,
//         accent: ttsConfig.accent,
//         speed: ttsConfig.speed
//       }, {
//         responseType: 'arraybuffer',
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
      
//       await fs.writeFile(audioFile, Buffer.from(response.data));
      
//       await lipSyncMessage(i, audioFile);
//       message.audio = await audioFileToBase64(audioFile);
//       message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
//     } catch (error) {
//       console.error('MeloTTS error:', error);
//       throw error;
//     }
//   }
//   return messages;
// };
