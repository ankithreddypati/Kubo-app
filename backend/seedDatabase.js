import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

dotenv.config();

// Admin Schema
const AdminSchema = new mongoose.Schema({
  adminId: { type: String, default: () => faker.string.uuid(), unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  company: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
});

// Customer Schema
const CustomerSchema = new mongoose.Schema({
  customerId: { type: String, default: () => faker.string.uuid(), unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  address: String,
  zipCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'AIAgent' }
});

// AI Agent Schema
const AIAgentSchema = new mongoose.Schema({
  agentId: { type: String, default: () => faker.string.uuid(), unique: true },
  name: { type: String, required: true },
  avatarUrl: { type: String, required: true },
  voice: { type: String, required: true },
  personality: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
});

// Product Schema
const ProductSchema = new mongoose.Schema({
  productId: { type: String, default: () => faker.string.uuid(), unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  manualUrl: String,
  productImages: [{ 
    url: String, 
    altText: String,
    isPrimary: { type: Boolean, default: false }
  }],
  troubleshootingSteps: [String],
  warrantyPeriod: { type: Number, required: true }, 
  releaseDate: Date,
  stockQuantity: { type: Number, default: 0 },
  product3dUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Agent Analytics Schema
const AgentAnalyticsSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIAgent', required: true },
  date: { type: Date, default: Date.now },
  interactionsCount: { type: Number, default: 0 },
  averageInteractionDuration: Number,
  successfulResolutions: { type: Number, default: 0 },
  customerSatisfactionScore: Number,
  commonQueries: [String]
});

// Knowledge Base Schema
const KnowledgeBaseSchema = new mongoose.Schema({
  id: { type: String, default: () => faker.string.uuid(), unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: String,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  lastUpdated: { type: Date, default: Date.now },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
});

// Conversation Schema
const ConversationSchema = new mongoose.Schema({
  id: { type: String, default: () => faker.string.uuid(), unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'AIAgent', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  isUserAuthenticated: { type: Boolean, default: false },
  transcript: [{
    speaker: { type: String, enum: ['customer', 'agent'] },
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  productDiscussed: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  outcome: String,
  customerSentiment: String,
  tags: [String]
});


// Order Schema
const OrderSchema = new mongoose.Schema({
  orderId: { type: String, default: () => faker.string.uuid(), unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: String,
  trackingNumber: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

// Create models from the schemas
export const Admin = mongoose.model('Admin', AdminSchema);
export const Customer = mongoose.model('Customer', CustomerSchema);
export const AIAgent = mongoose.model('AIAgent', AIAgentSchema);
export const Product = mongoose.model('Product', ProductSchema);
export const AgentAnalytics = mongoose.model('AgentAnalytics', AgentAnalyticsSchema);
export const KnowledgeBase = mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
export const Conversation = mongoose.model('Conversation', ConversationSchema);
export const Order = mongoose.model('Order', OrderSchema);

// // Function to generate sample data
// async function generateSampleData() {
//   try {
//     // Create two admins
//     const admin1 = await Admin.create({
//       name: faker.person.fullName(),
//       email: faker.internet.email(),
//       phone: faker.phone.number(),
//       company: faker.company.name()
//     });

//     const admin2 = await Admin.create({
//       name: faker.person.fullName(),
//       email: faker.internet.email(),
//       phone: faker.phone.number(),
//       company: faker.company.name()
//     });

//     console.log('Admins created:', admin1, admin2);

//     // Create two AI agents
//     const agent1 = await AIAgent.create({
//       name: faker.person.firstName(),
//       avatarUrl: faker.image.avatar(),
//       voice: faker.helpers.arrayElement(['male', 'female', 'neutral']),
//       personality: faker.helpers.arrayElement(['friendly', 'professional', 'humorous']),
//       assignedBy: admin1._id
//     });

//     const agent2 = await AIAgent.create({
//       name: faker.person.firstName(),
//       avatarUrl: faker.image.avatar(),
//       voice: faker.helpers.arrayElement(['male', 'female', 'neutral']),
//       personality: faker.helpers.arrayElement(['friendly', 'professional', 'humorous']),
//       assignedBy: admin2._id
//     });

//     console.log('AI Agents created:', agent1, agent2);

//     // Create three customers related to admin1
//     const customers = await Customer.create([
//       {
//         name: faker.person.fullName(),
//         email: faker.internet.email(),
//         phone: faker.phone.number(),
//         address: faker.location.streetAddress(),
//         zipCode: faker.location.zipCode(),
//         admin: admin1._id,
//         assignedAgent: agent1._id
//       },
//       {
//         name: faker.person.fullName(),
//         email: faker.internet.email(),
//         phone: faker.phone.number(),
//         address: faker.location.streetAddress(),
//         zipCode: faker.location.zipCode(),
//         admin: admin1._id,
//         assignedAgent: agent1._id
//       },
//       {
//         name: faker.person.fullName(),
//         email: faker.internet.email(),
//         phone: faker.phone.number(),
//         address: faker.location.streetAddress(),
//         zipCode: faker.location.zipCode(),
//         admin: admin1._id,
//         assignedAgent: agent1._id
//       }
//     ]);

//     console.log('Customers created:', customers);

//     // Create some products
//     const products = await Product.create([
//       {
//         name: faker.commerce.productName(),
//         category: faker.commerce.department(),
//         price: faker.commerce.price(),
//         admin: admin1._id,
//         warrantyPeriod: faker.number.int({ min: 6, max: 24 }),
//         stockQuantity: faker.number.int({ min: 0, max: 100 })
//       },
//       {
//         name: faker.commerce.productName(),
//         category: faker.commerce.department(),
//         price: faker.commerce.price(),
//         admin: admin2._id,
//         warrantyPeriod: faker.number.int({ min: 6, max: 24 }),
//         stockQuantity: faker.number.int({ min: 0, max: 100 })
//       }
//     ]);

//     console.log('Products created:', products);

//     // Create some knowledge base entries
//     const knowledgeBaseEntries = await KnowledgeBase.create([
//       {
//         title: faker.lorem.sentence(),
//         content: faker.lorem.paragraphs(),
//         category: faker.helpers.arrayElement(['FAQ', 'Troubleshooting', 'User Guide']),
//         products: [products[0]._id],
//         admin: admin1._id
//       },
//       {
//         title: faker.lorem.sentence(),
//         content: faker.lorem.paragraphs(),
//         category: faker.helpers.arrayElement(['FAQ', 'Troubleshooting', 'User Guide']),
//         products: [products[1]._id],
//         admin: admin2._id
//       }
//     ]);

//     console.log('Knowledge Base entries created:', knowledgeBaseEntries);

//     // Create some conversations
//     const conversations = await Conversation.create([
//       {
//         customer: customers[0]._id,
//         admin: admin1._id,
//         agentId: agent1._id,
//         startTime: faker.date.recent(),
//         endTime: faker.date.recent(),
//         transcript: [
//           { speaker: 'customer', message: faker.lorem.sentence(), timestamp: faker.date.recent() },
//           { speaker: 'agent', message: faker.lorem.sentence(), timestamp: faker.date.recent() }
//         ],
//         productDiscussed: products[0]._id,
//         outcome: faker.helpers.arrayElement(['resolved', 'pending', 'escalated']),
//         customerSentiment: faker.helpers.arrayElement(['positive', 'neutral', 'negative']),
//         tags: [faker.word.adjective(), faker.word.noun()]
//       }
//     ]);

//     console.log('Conversations created:', conversations);

//     // Create some orders
//     const orders = await Order.create([
//       {
//         customer: customers[0]._id,
//         admin: admin1._id,
//         products: [{ product: products[0]._id, quantity: faker.number.int({ min: 1, max: 5 }) }],
//         totalAmount: faker.commerce.price(),
//         status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered']),
//         shippingAddress: faker.location.streetAddress(),
//         trackingNumber: faker.string.alphanumeric(10)
//       }
//     ]);

//     console.log('Orders created:', orders);

//     console.log('Sample data generated successfully');
//   } catch (error) {
//     console.error('Error generating sample data:', error);
//   }
// }

// // Connect to MongoDB and generate sample data
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log('Connected to MongoDB');
//     return generateSampleData();
//   })
//   .then(() => {
//     console.log('Sample data generation complete');
//     mongoose.disconnect();
//   })
//   .catch((error) => {
//     console.error('Error:', error);
//     mongoose.disconnect();
//   });