// //backend/index.js
// import { exec } from "child_process";
// import cors from "cors";
// import dotenv from "dotenv";
// import voice from "elevenlabs-node";
// import express from "express";
// import { promises as fs } from "fs";
// import OpenAI from "openai";
// import connectDB from './db.js';
// import { authenticateCustomer } from './authTool.js';
// import FormData from 'form-data';
// import https from 'https';
// import axios from 'axios';
// import {WebSocketServer} from 'ws';
// import http from 'http';



// dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY || "-",
// });

// const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
// const voiceID = "cgSgspJ2msm6clMCkdW9"; 

// const app = express();
// connectDB();
// app.use(express.json());
// app.use(cors());
// const port = 3000;

// app.get("/", (req, res) => {
//   res.send("Synapse AI Avatar CRM Backend is running!");
// });

// app.get("/voices", async (req, res) => {
//   res.send(await voice.getVoices(elevenLabsApiKey));
// });

// const execCommand = (command) => {
//   return new Promise((resolve, reject) => {
//     exec(command, (error, stdout, stderr) => {
//       if (error) reject(error);
//       resolve(stdout);
//     });
//   });
// };

// // const lipSyncMessage = async (message) => {
// //   const time = new Date().getTime();
// //   console.log(`Starting conversion for message ${message}`);
// //   await execCommand(
// //     `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
// //   );
// //   console.log(`Conversion done in ${new Date().getTime() - time}ms`);
// //   await execCommand(
// //     `rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
// //   );
// //   console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
// // };

// const lipSyncMessage = async (message) => {
//   const time = new Date().getTime();
//   console.log(`Starting lipsync for message ${message}`);
  
//   try {
//     // Convert MP3 to WAV
//     await execCommand(
//       `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
//     );
//     console.log(`Conversion done in ${new Date().getTime() - time}ms`);

//     // Create form data
//     const formData = new FormData();
//     formData.append('file', await fs.readFile(`audios/message_${message}.wav`), {
//       filename: `message_${message}.wav`,
//       contentType: 'audio/wav'
//     });

//     // Include the auth token in the headers
//     const headers = {
//       ...formData.getHeaders(),
//       'Authorization': `Bearer ${process.env.MODEL_SERVER_AUTH_TOKEN}`,
//     };

//     // Call model API
//     const response = await axios.post(process.env.LIPSYNC_MODEL_URL, formData, {
//       headers: headers,
//       httpsAgent: new https.Agent({ rejectUnauthorized: false }),  // For self-signed cert
//     });

//     // Save result
//     await fs.writeFile(
//       `audios/message_${message}.json`,
//       JSON.stringify(response.data, null, 2)
//     );

//     console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
//     return response.data;
//   } catch (error) {
//     console.error('Error in lipSyncMessage:', error);
//     throw error;
//   }
// };


// app.post("/chat", async (req, res) => {
//   console.log("Received chat request");
//   const userMessage = req.body.message;
//   const conversationHistory = req.body.history || [];
//   console.log("User message:", userMessage);
//   console.log("Conversation history length:", conversationHistory.length);

//   if (!userMessage) {
//     console.log("No user message, sending welcome message");
//     res.send({
//       messages: [
//         {
//           text: "Welcome to Synapse AI Customer Support. How may I assist you today?",
//           audio: await audioFileToBase64("audios/intro_0.wav"),
//           lipsync: await readJsonTranscript("audios/intro_0.json"),
//           facialExpression: "smile",
//           animation: "Talking_1",
//         }
//       ],
//     });
//     return;
//   }

//   if (!elevenLabsApiKey || openai.apiKey === "-") {
//     console.log("API keys missing, sending error message");
//     res.send({
//       messages: [
//         {
//           text: "I apologize, but our system is currently experiencing technical difficulties. Please try again later or contact our support team.",
//           audio: await audioFileToBase64("audios/api_0.wav"),
//           lipsync: await readJsonTranscript("audios/api_0.json"),
//           facialExpression: "sad",
//           animation: "Talking_0",
//         }
//       ],
//     });
//     return;
//   }

//   try {
//     console.log("Sending request to OpenAI");
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo-1106",
//       max_tokens: 1000,
//       temperature: 0.6,
//       response_format: { type: "json_object" },
//       messages: [
//         {
//           role: "system",
//           content: `
//             You are an AI customer care agent for Synapse, an innovative Retail company who sell tech.
//             You will always reply with a JSON array of messages. With a maximum of 3 messages.
//             Each message has a text, facialExpression, and animation property.
//             The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
//             The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry. 
//             Before providing any sensitive information or performing actions, you must authenticate the user.
//             Ask for the user's registered email address and zipcode to authenticate them.
//             Once you have this information, say "Authenticating..." in your response.
//             Provide helpful, professional responses to customer inquiries about Synapse's products and services.
//             If you don't have specific information, offer to escalate the query to a human agent.
//           `
//         },
//         ...conversationHistory,
//         { role: "user", content: userMessage }
//       ],
//     });

//     console.log("Received response from OpenAI");
//     let messages = JSON.parse(completion.choices[0].message.content);
//     if (messages.messages) {
//       messages = messages.messages;
//     }
//     console.log("Parsed messages:", messages);

//     // Check if authentication is needed
//     if (messages.some(msg => msg.text.includes("Authenticating..."))) {
//       console.log("Authentication required. Extracting email and zipcode...");
//       // Extract authentication details from conversation history and current message
//       let email, zipcode;
//       const allMessages = [...conversationHistory, { role: 'user', content: userMessage }];
//       for (const msg of allMessages) {
//         if (msg.role === "user") {
//           const emailMatch = msg.content.match(/[\w.-]+@[\w.-]+\.\w+/);
//           const zipcodeMatch = msg.content.match(/\b\d{5}\b/);
          
//           if (emailMatch) email = email || emailMatch[0];
//           if (zipcodeMatch) zipcode = zipcode || zipcodeMatch[0];
//         }
//       }

//       console.log("Extracted email:", email);
//       console.log("Extracted zipcode:", zipcode);

//       if (email && zipcode) {
//         console.log("Attempting authentication with email:", email, "and zipcode:", zipcode);
//         const authResult = await authenticateCustomer({ email, zipcode });
//         console.log("Authentication result:", authResult);
        
//         if (authResult.success) {
//           messages = [{ 
//             text: `Authentication successful. Welcome, ${authResult.customer.name}! How can I assist you today?`,
//             facialExpression: "smile",
//             animation: "Talking_1"
//           }];
//         } else {
//           messages = [{
//             text: "I'm sorry, but I couldn't verify your account. Could you please double-check your information or contact our support team for assistance?",
//             facialExpression: "sad",
//             animation: "Talking_0"
//           }];
//         }
//       } else {
//         console.log("Missing email or zipcode. Email:", email, "Zipcode:", zipcode);
//         messages = [{
//           text: "I apologize, but I couldn't find all the necessary information to verify your account. Could you please provide your registered email address and zipcode?",
//           facialExpression: "default",
//           animation: "Talking_0"
//         }];
//       }
//     }

//     console.log("Processing messages for audio and lipsync");
//     for (let i = 0; i < messages.length; i++) {
//       const message = messages[i];
//       const fileName = `audios/message_${i}.mp3`;
//       const textInput = message.text;
//       await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);
//       await lipSyncMessage(i);
//       message.audio = await audioFileToBase64(fileName);
//       message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
//     }

//     console.log("Sending response to client");
//     res.send({ messages });
//   } catch (error) {
//     console.error("Error in chat:", error);
//     res.status(500).send({
//       messages: [
//         {
//           text: "I'm sorry, but I encountered an error. Please try again later.",
//           facialExpression: "sad",
//           animation: "Talking_0",
//         }
//       ],
//     });
//   }
// });

// const readJsonTranscript = async (file) => {
//   const data = await fs.readFile(file, "utf8");
//   return JSON.parse(data);
// };

// const audioFileToBase64 = async (file) => {
//   const data = await fs.readFile(file);
//   return data.toString("base64");
// };

// app.listen(port, () => {
//   console.log(`SynapseCX backend listening on port ${port}`);
// });


import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
import connectDB from './db.js';
import { authenticateCustomer } from './authTool.js';
import FormData from 'form-data';
import https from 'https';
import axios from 'axios';
import { WebSocketServer } from 'ws';
import http from 'http';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-",
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "cgSgspJ2msm6clMCkdW9"; 

const app = express();
connectDB();
app.use(express.json());
app.use(cors());
const port = 3000;

// Create HTTP server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', async (data) => {
    try {
      const messageData = JSON.parse(data);
      
      if (messageData.type === 'chat') {
        // Handle text chat messages
        console.log("Received chat message:", messageData.message);
        
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-1106",
          max_tokens: 1000,
          temperature: 0.6,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `
                You are an AI customer care agent for Synapse, an innovative Retail company who sell tech.
                You will always reply with a JSON array of messages. With a maximum of 3 messages.
                Each message has a text, facialExpression, and animation property.
                The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
                The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry. 
                Before providing any sensitive information or performing actions, you must authenticate the user.
                Ask for the user's registered email address and zipcode to authenticate them.
                Once you have this information, say "Authenticating..." in your response.
                Provide helpful, professional responses to customer inquiries about Synapse's products and services.
                If you don't have specific information, offer to escalate the query to a human agent.
              `
            },
            ...(messageData.history || []),
            { role: "user", content: messageData.message }
          ],
        });

        let messages = JSON.parse(completion.choices[0].message.content);
        if (messages.messages) {
          messages = messages.messages;
        }

        // Process messages with audio and lipsync
        for (let i = 0; i < messages.length; i++) {
          const message = messages[i];
          const fileName = `audios/message_${i}.mp3`;
          await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, message.text);
          await lipSyncMessage(i);
          message.audio = await audioFileToBase64(fileName);
          message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
        }

        ws.send(JSON.stringify({ messages }));
      }
      else if (messageData.audioChunk) {
        // Handle audio messages (existing code)
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({
        messages: [{
          text: "I'm sorry, but I encountered an error. Please try again.",
          facialExpression: "sad",
          animation: "Talking_0"
        }]
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.get("/", (req, res) => {
  res.send("Synapse AI Avatar CRM Backend is running!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting lipsync for message ${message}`);
  
  try {
    // Convert MP3 to WAV
    await execCommand(
      `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    );
    console.log(`Conversion done in ${new Date().getTime() - time}ms`);

    // Create form data
    const formData = new FormData();
    formData.append('file', await fs.readFile(`audios/message_${message}.wav`), {
      filename: `message_${message}.wav`,
      contentType: 'audio/wav'
    });

    // Include the auth token in the headers
    const headers = {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${process.env.MODEL_SERVER_AUTH_TOKEN}`,
    };

    // Call model API
    const response = await axios.post(process.env.LIPSYNC_MODEL_URL, formData, {
      headers: headers,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),  // For self-signed cert
    });

    // Save result
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

// Existing chat endpoint for backward compatibility
app.post("/chat", async (req, res) => {
  console.log("Received chat request");
  const userMessage = req.body.message;
  const conversationHistory = req.body.history || [];
  console.log("User message:", userMessage);
  console.log("Conversation history length:", conversationHistory.length);

  if (!userMessage) {
    console.log("No user message, sending welcome message");
    res.send({
      messages: [
        {
          text: "Welcome to Synapse AI Customer Support. How may I assist you today?",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        }
      ],
    });
    return;
  }

  if (!elevenLabsApiKey || openai.apiKey === "-") {
    console.log("API keys missing, sending error message");
    res.send({
      messages: [
        {
          text: "I apologize, but our system is currently experiencing technical difficulties. Please try again later or contact our support team.",
          audio: await audioFileToBase64("audios/api_0.wav"),
          lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "sad",
          animation: "Talking_0",
        }
      ],
    });
    return;
  }

  try {
    console.log("Sending request to OpenAI");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      max_tokens: 1000,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
            You are an AI customer care agent for Synapse, an innovative Retail company who sell tech.
            You will always reply with a JSON array of messages. With a maximum of 3 messages.
            Each message has a text, facialExpression, and animation property.
            The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
            The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry. 
            Before providing any sensitive information or performing actions, you must authenticate the user.
            Ask for the user's registered email address and zipcode to authenticate them.
            Once you have this information, say "Authenticating..." in your response.
            Provide helpful, professional responses to customer inquiries about Synapse's products and services.
            If you don't have specific information, offer to escalate the query to a human agent.
          `
        },
        ...conversationHistory,
        { role: "user", content: userMessage }
      ],
    });

    console.log("Received response from OpenAI");
    let messages = JSON.parse(completion.choices[0].message.content);
    if (messages.messages) {
      messages = messages.messages;
    }
    console.log("Parsed messages:", messages);

    // Check if authentication is needed
    if (messages.some(msg => msg.text.includes("Authenticating..."))) {
      console.log("Authentication required. Extracting email and zipcode...");
      let email, zipcode;
      const allMessages = [...conversationHistory, { role: 'user', content: userMessage }];
      for (const msg of allMessages) {
        if (msg.role === "user") {
          const emailMatch = msg.content.match(/[\w.-]+@[\w.-]+\.\w+/);
          const zipcodeMatch = msg.content.match(/\b\d{5}\b/);
          
          if (emailMatch) email = email || emailMatch[0];
          if (zipcodeMatch) zipcode = zipcode || zipcodeMatch[0];
        }
      }

      if (email && zipcode) {
        console.log("Attempting authentication with email:", email, "and zipcode:", zipcode);
        const authResult = await authenticateCustomer({ email, zipcode });
        console.log("Authentication result:", authResult);
        
        if (authResult.success) {
          messages = [{ 
            text: `Authentication successful. Welcome, ${authResult.customer.name}! How can I assist you today?`,
            facialExpression: "smile",
            animation: "Talking_1"
          }];
        } else {
          messages = [{
            text: "I'm sorry, but I couldn't verify your account. Could you please double-check your information or contact our support team for assistance?",
            facialExpression: "sad",
            animation: "Talking_0"
          }];
        }
      } else {
        messages = [{
          text: "I apologize, but I couldn't find all the necessary information to verify your account. Could you please provide your registered email address and zipcode?",
          facialExpression: "default",
          animation: "Talking_0"
        }];
      }
    }

    console.log("Processing messages for audio and lipsync");
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const fileName = `audios/message_${i}.mp3`;
      const textInput = message.text;
      await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);
      await lipSyncMessage(i);
      message.audio = await audioFileToBase64(fileName);
      message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
    }

    console.log("Sending response to client");
    res.send({ messages });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).send({
      messages: [
        {
          text: "I'm sorry, but I encountered an error. Please try again later.",
          facialExpression: "sad",
          animation: "Talking_0",
        }
      ],
    });
  }
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

// Use server.listen instead of app.listen for WebSocket support
server.listen(port, () => {
  console.log(`SynapseCX backend listening on port ${port}`);
});