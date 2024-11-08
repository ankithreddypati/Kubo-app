// tools/VectorServiceClient.js
import axios from 'axios';

class VectorServiceClient {
    constructor() {
        this.baseUrl = process.env.VECTOR_SERVICE_URL || 'http://localhost:8101';
    }

    async updateVectors(conversationId, messages) {
        try {
            const response = await axios.post(`${this.baseUrl}/vectorize-and-store`, {
                conversation_id: conversationId,
                messages
            });
            return response.data;
        } catch (error) {
            console.error('Vector service error:', error);
            throw error;
        }
    }

    async getRelevantContext(conversationId, query) {
        try {
            const response = await axios.post(`${this.baseUrl}/get-relevant-context`, {
                conversation_id: conversationId,
                query,
                max_results: 3
            });
            return response.data;
        } catch (error) {
            console.error('Context retrieval error:', error);
            throw error;
        }
    }
}

export default new VectorServiceClient();