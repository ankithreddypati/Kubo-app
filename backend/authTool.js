//authTool.js
import { Customer } from './seedDatabase.js'

export const authenticateCustomer = async ({ email, zipcode }) => {
  console.log("authenticateCustomer function called with:", { email, zipcode });
  try {
    console.log("Searching for customer with email:", email, "and zipcode:", zipcode);
    const customer = await Customer.findOne({ email, zipCode: zipcode });
    console.log("Database query result:", customer);

    if (!customer) {
      console.log("Customer not found in the database");
      return { success: false, message: "Customer not found or invalid credentials" };
    }
    
    console.log("Customer found, updating lastLogin");
    customer.lastLogin = new Date();
    await customer.save();
    console.log("Customer lastLogin updated");

    console.log("Authentication successful for customer:", customer.name);
    return { 
      success: true, 
      message: "Authentication successful",
      customer: {
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        admin: customer.admin,
        assignedAgent: customer.assignedAgent
      }
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, message: "An error occurred during authentication" };
  }
};