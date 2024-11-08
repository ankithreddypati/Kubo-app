// backend/agent.js
import { ChatOpenAI } from "@langchain/openai";
import { Tool } from "@langchain/core/tools";
import { HumanMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { authenticateCustomer } from './tools/authTool.js';

let model;

// Function to set the model client
function setModelClient(modelClient) {
  model = modelClient;
}

// Define the tools for the agent to use
class AuthTool extends Tool {
  constructor() {
    super();
    this.name = "authenticate_customer";
    this.description = "Authenticate a customer based on their last four digits of phone number and zip code.";
  }

  async _call(input) {
    const { phoneLastFour, zipcode } = JSON.parse(input);
    const result = await authenticateCustomer({ phoneLastFour, zipcode });
    return JSON.stringify(result);
  }
}

const tools = [new AuthTool()];
const toolNode = new ToolNode(tools);

// Define the function that determines whether to continue or not
function shouldContinue({ messages }) {
  const lastMessage = messages[messages.length - 1];

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.additional_kwargs && lastMessage.additional_kwargs.tool_calls) {
    return "tools";
  }
  // Otherwise, we stop (reply to the user) using the special "__end__" node
  return "__end__";
}

// Define the function that calls the model
async function callModel(state) {
  const response = await model.invoke(state.messages);

  // We return a list, because this will get added to the existing list
  return { messages: [response] };
}

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

// Finally, we compile it into a LangChain Runnable.
const app = workflow.compile();

export {
  app,
  setModelClient
};