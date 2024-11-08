// models/Customer.js
import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
    customer_id: String,
    name: String,
    email: String,
    address: String,
    zip: String,
    phone: String
});

export default mongoose.model('Customers', CustomerSchema, 'Customers');