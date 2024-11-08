import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  warrantyPeriod: {
    type: Number, // Assuming months
    required: true
  },
  warrantyInfo: {
    coverage: {
      type: String,
      required: true
    },
    exclusions: {
      type: String,
      required: true
    }
  },
  manualUrl: {
    type: String,
    required: true
  },
  manualVector: {
    type: [Number], 
    validate: {
      validator: function(v) {
        return v == null || v.length === 128; 
      },
      message: 'Vector must have the correct dimensions'
    },
    default: undefined
  }
});

ProductSchema.index(
  { manualVector: "vectorSearch" },
  {
    name: "manualVectorIndex",
    vectorSearchOptions: {
      dimensions: 128, 
      similarity: "cosine"
    }
  }
);

export default mongoose.model('Product', ProductSchema);
