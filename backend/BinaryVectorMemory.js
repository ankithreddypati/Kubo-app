// import axios from 'axios';
// import dotenv from "dotenv";
// import https from 'https';

// dotenv.config();

// class BinaryVectorMemory {
//     constructor(conversationId) {
//       this.conversationId = conversationId;
//       this.baseUrl = "https://llmserver-ankithreddy137-dev.apps.cluster.intel.sandbox1234.opentlc.com/codeserver/proxy/8101";
      
//       const token = process.env.LLM_SERVER_TOKEN;
//       if (!token) {
//         console.warn('No LLM_SERVER_TOKEN provided - authentication may fail');
//       }
      
//       this.headers = {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       };
//     }
  
//     async loadMemoryVariables(values) {
//       try {
//         if (!values || !values.input) {
//           return { history: "", relevantMessages: [] };
//         }
  
//         // Then get relevant context
//         const response = await axios.post(`${this.baseUrl}/get-relevant-context`, {
//           conversation_id: this.conversationId,
//           query: values.input,
//           max_results: 3
//         }, {
//           headers: this.headers,
//           timeout: 5000,
//           httpsAgent: new https.Agent({ rejectUnauthorized: false })
//         });
        
//         if (!response.data) {
//           return { history: "", relevantMessages: [] };
//         }

//         return {
//           history: response.data.formatted_context || "",
//         };
//       } catch (error) {
//         console.error('Error loading memory:', error.response?.data || error.message);
//         return { history: "", relevantMessages: [] };
//       }
//     }
  
//     async saveContext(inputValues, outputValues) {
//       try {
//         if (!inputValues?.input || !outputValues?.response) {
//           return;
//         }
  
//         await this.updateVectors([
//           { 
//             content: inputValues.input, 
//             role: 'user'
//           },
//           { 
//             content: outputValues.response, 
//             role: 'assistant'
//           }
//         ]);
//       } catch (error) {
//         console.error('Error saving context:', error.response?.data || error.message);
//       }
//     }
  
//      async updateVectors(messages) {
//       try {
//         await axios.post(`${this.baseUrl}/vectorize-and-store`, {
//           conversation_id: this.conversationId,
//           messages: messages
//         }, {
//           headers: this.headers,
//           timeout: 5000,
//           httpsAgent: new https.Agent({ rejectUnauthorized: false })
//         });
//       } catch (error) {
//         console.error('Error updating vectors:', error.response?.data || error.message);
//       }
//     }
// }

// export default BinaryVectorMemory;