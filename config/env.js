import dotenv from 'dotenv';

// Load environment variables from a `.env` file into `process.env`
dotenv.config();

// Export the environment variables using ES Module export syntax
export const mongoDbUrl = process.env.MONGO_DB_URL;
// export const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
export const paypalClientID = process.env.paypalClientID;
export const paypalSecret = process.env.paypalSecret;
// export const port = process.env.PORT;

