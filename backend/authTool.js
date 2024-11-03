// authTool.js
import { Customer } from './seedDatabase.js';

// Store authenticated sessions
const authenticatedSessions = new Map();

export const authenticateCustomer = async ({ email, zipcode, sessionId }) => {
  console.log("authenticateCustomer function called with:", { email, zipcode, sessionId });

  // Check if session is already authenticated
  if (sessionId && authenticatedSessions.has(sessionId)) {
    console.log("User already authenticated in session:", sessionId);
    return authenticatedSessions.get(sessionId);
  }

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

    const authResult = { 
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

    // Store authentication result in session if sessionId is provided
    if (sessionId) {
      authenticatedSessions.set(sessionId, authResult);
      
      // Optional: Set expiry for the session (e.g., 24 hours)
      setTimeout(() => {
        authenticatedSessions.delete(sessionId);
      }, 24 * 60 * 60 * 1000);
    }

    return authResult;
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, message: "An error occurred during authentication" };
  }
};

export const isAuthenticated = (sessionId) => {
  return authenticatedSessions.has(sessionId);
};

export const getAuthenticatedUser = (sessionId) => {
  return authenticatedSessions.get(sessionId);
};

export const clearAuthentication = (sessionId) => {
  return authenticatedSessions.delete(sessionId);
};
