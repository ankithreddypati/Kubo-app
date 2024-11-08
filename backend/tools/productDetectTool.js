import { tool } from "@langchain/core/tools";
import { z } from "zod";
import FormData from 'form-data';
import axios from 'axios';
import Product from '../models/Product.js';
import Conversation from '../models/Conversation.js';

export const createProductDetectionTool = () => {
  return tool(
    async ({ imageBase64, conversationId }) => {
      try {
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(imageBase64.split(',')[1], 'base64');
        
        // Create FormData
        const formData = new FormData();
        formData.append('files', imageBuffer, 'webcam.jpg');

        // Send to YOLO server with timeout
        const response = await axios.post(
          'http://127.0.0.1:6969/predict', 
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              'accept': 'application/json'
            },
            timeout: 10000 // 10 second timeout
          }
        );

        if (response.data.predictions?.[0]?.detections?.[0]) {
          const detection = response.data.predictions[0].detections[0];
          const yoloProductName = detection.product_name;

          // Find product in database
          const product = await Product.findOne({
            $or: [
              { name: { $regex: yoloProductName.replace(/_/g, ' '), $options: 'i' } },
              { model: { $regex: yoloProductName.replace(/_/g, ' '), $options: 'i' } }
            ]
          });

          if (product) {
            // Update conversation with detected product
            await Conversation.findOneAndUpdate(
              { conversationId },
              {
                $push: {
                  detectedProducts: {
                    productId: product._id,
                    product_id: product.product_id,
                    detectedAt: new Date(),
                    confidence: detection.confidence
                  }
                }
              }
            );

            return {
              content: `I can see you have a ${product.name} ${product.color}. It's a great ${product.category}!`,
              artifact: {
                success: true,
                productInfo: {
                  id: product._id,
                  name: product.name,
                  category: product.category,
                  color: product.color,
                  confidence: detection.confidence
                },
                facialExpression: "smile",
                animation: "Excited"
              }
            };
          }
        }

        return {
          content: "I'm not able to identify the product clearly. Could you try showing it from a different angle?",
          artifact: {
            success: false,
            message: "Product not identified",
            facialExpression: "concerned",
            animation: "Thinking"
          }
        };

      } catch (error) {
        console.error('Product detection error:', error);
        return {
          content: "I'm having trouble processing the image. Could you try again?",
          artifact: {
            success: false,
            error: error.message,
            message: "Image processing failed",
            facialExpression: "sad",
            animation: "Talking1"
          }
        };
      }
    },
    {
      name: "detect_product",
      description: "Help user Detect and identify a product from a webcam image",
      schema: z.object({
        imageBase64: z.string()
          .min(1)
          .describe("Base64 encoded image string from webcam"),
        conversationId: z.string()
          .min(1)
          .describe("Unique identifier for the current conversation")
      }),
      responseFormat: "content_and_artifact"
    }
  );
};