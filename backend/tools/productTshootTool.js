import { tool } from "@langchain/core/tools";
import axios from 'axios';
import { z } from "zod";

export const createproductTroubleshootingTool = () => {
  return tool(
        async ({ query }) => {
      try {
        const response = await axios.post('http://localhost:8101/get-product-context', {
          query
        });

        const { formatted_context } = response.data;

        if (!formatted_context) {
          return {
            content: "I couldn't find specific information about that in the product documentation.",
            artifact: {
              success: false,
              facialExpression: "concerned",
              animation: "Thinking"
            }
          };
        }

        return {
          content: formatted_context,
          artifact: {
            success: true,
            facialExpression: "smile",
            animation: "Talking"
          }
        };

      } catch (error) {
        console.error('Error:', error);
        return {
          content: "I encountered an error while searching the documentation.",
          artifact: {
            success: false,
            error: error.message,
            facialExpression: "sad",
            animation: "Talking1"
          }
        };
      }
    },
    {
      name: "search_product_docs",
      description: "Search product documentation for information about features, troubleshooting, or usage.",
      schema: z.object({
        query: z.string().describe("Question about the product features or issues")
      })
    }
  );
};