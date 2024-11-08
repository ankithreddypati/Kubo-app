// test-chat.js
import dotenv from 'dotenv';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { authenticateCustomer } from './tools/authTool.js';
import mongoose from 'mongoose';
import readline from 'readline';

dotenv.config();

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Auth tool setup
const authTool = tool(
  async ({ phoneLastFour, zipcode, conversationId }) => {
    const result = await authenticateCustomer({ 
      phoneLastFour, 
      zipcode, 
      conversationId 
    });
    return result.message;
  },
  {
    name: "authenticate_customer",
    description: "Verify customer identity using last 4 digits of phone and zipcode",
    schema: z.object({
      phoneLastFour: z.string().length(4).describe("Last 4 digits of customer's phone number"),
      zipcode: z.string().describe("Customer's ZIP code"),
      conversationId: z.string().describe("Current conversation ID")
    })
  }
);

// Output parser setup
const outputParser = new JsonOutputParser({
  schema: z.array(
    z.object({
      text: z.string().describe("Message content"),
      facialExpression: z.string().describe("Facial expression for the response"),
      animation: z.string().describe("Animation associated with the response"),
    })
  ),
});

async function chat() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo-1106",
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.6,
    });

    // Configure model with auth tool
    const modelWithTools = model.bind({
      tools: [authTool],
      tool_choice: {
        type: "function",
        function: { name: "authenticate_customer" }
      }
    });

    const prompt = ChatPromptTemplate.fromTemplate(`
      You are an AI customer care agent for Kubo who sell tech products.
      Before helping customers, you MUST authenticate them first.
      
      IMPORTANT:
      1. Ask for the last 4 digits of their phone number and ZIP code
      2. Use the authenticate_customer tool to verify their identity
      3. Only proceed with their request after successful authentication
      
      Always reply with a JSON array of messages, each containing 'text', 'facialExpression', and 'animation'.
      
      User message: {user_message}
    `);

    const chain = prompt.pipe(modelWithTools).pipe(outputParser);

    // Initial greeting
    const response = await chain.invoke({
      user_message: "Hello"
    });

    console.log("\nBot:", response[0].text);

    // Start chat loop
    const askQuestion = () => {
      rl.question('\nYou: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
          await mongoose.disconnect();
          rl.close();
          return;
        }

        try {
          const response = await chain.invoke({
            user_message: input
          });
          console.log("\nBot:", response[0].text);
          askQuestion();
        } catch (error) {
          console.error('Error:', error);
          askQuestion();
        }
      });
    };

    askQuestion();

  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    rl.close();
  }
}

console.log("Starting chat... (type 'exit' to quit)");
chat();