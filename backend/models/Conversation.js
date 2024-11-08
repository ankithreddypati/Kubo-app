// models/Conversation.js

import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
    conversationId: {
      type: String,
      required: true,
      unique: true,
      default: () => 'CONV-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    },
    customerId: {
      type: String,
      ref: 'Customer'  
    },
    isAuthenticated: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active'
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    chatHistory: [{
      role: {
        type: String,
        enum: ['user', 'assistant', 'system']
      },
      content: String,
      type: {
        type: String,
        enum: ['text', 'audio'],
        default: 'text'
      },
      metadata: {
        facialExpression: String,
        animation: String
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    chatHistoryBinaryVectors: {
      type: [Number],
      validate: {
        validator: function(v) {
          // Make it optional - either undefined/null or correct length
          return v == null || v.length === 0 || v.length === 128;
        },
        message: 'Binary vector must have correct dimensions'
      },
      default: undefined  // Make it optional
    }
  });

// Index for vector search
ConversationSchema.index(
  { chatHistoryBinaryVectors: "vectorSearch" },
  {
    name: "vectorIndex",
    vectorSearchOptions: {
      dimensions: 128,
      similarity: "euclidean"
    }
  }
);

export default mongoose.model('Conversation', ConversationSchema);