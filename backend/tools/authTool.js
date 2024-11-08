import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Customer from '../models/Customer.js';

export const createAuthenticationTool = () => {
  return tool(
    async ({ phoneLastFour }) => {
      try {
        // Simple find by last 4 digits anywhere in phone number
        const customer = await Customer.findOne({
          phone: { $regex: phoneLastFour }
        });

        if (customer) {
          return {
            content: `Authentication successful. Customer ${customer.name} verified.`,
            artifact: {
              success: true,
              customerId: customer._id,
              name: customer.name,
              message: `Successfully authenticated welcome back ${customer.name}`,
              facialExpression: "smile",
              animation: "Waving"
            }
          };
        }

        return {
          content: "Authentication failed. Could not verify the phone number.",
          artifact: {
            success: false,
            message: "Could not verify customer details",
            facialExpression: "concerned",
            animation: "Thinking"
          }
        };

      } catch (error) {
        console.error('Authentication error:', error);
        return {
          content: "An error occurred during authentication. Please try again.",
          artifact: {
            success: false,
            message: "Authentication error occurred",
            error: error.message,
            facialExpression: "sad",
            animation: "Talking1"
          }
        };
      }
    },
    {
      name: "authenticate_customer",
      description: "Authenticate a customer using last 4 digits of phone number",
      schema: z.object({
        phoneLastFour: z.string().describe("Last 4 digits of customer's phone number")
      }),
      responseFormat: "content_and_artifact"
    }
  );
};