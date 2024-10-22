// Import the Mongoose library for interacting with MongoDB
import mongoose from 'mongoose'

// Retrieve the MongoDB connection URI from the environment variables
const MONGODB_URI = process.env.MONGODB_URI

// Throw an error if the MongoDB URI is not defined in the environment variables
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

// Check if there's already a cached connection in the global object
// This is to avoid re-opening a connection when using serverless environments like Vercel or AWS Lambda
let cached = global.mongoose

// If there's no cached connection, initialize it as an object with `conn` and `promise` set to null
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

// Async function to connect to the MongoDB database
async function dbConnect() {
  // If a connection is already established, return the cached connection
  if (cached.conn) {
    return cached.conn
  }

  // If no connection promise exists, create one using Mongoose's connect method
  if (!cached.promise) {
    // Options for Mongoose connection
    const opts = {
      bufferCommands: false, // Disable buffering to prevent holding queries while reconnecting
      serverSelectionTimeoutMS: 5000, // Reduce the server selection timeout to 5 seconds
    }

    // Create a connection promise and store it in the cache
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose // Return the Mongoose instance once connected
    })
  }

  try {
    // Await the promise to establish the connection and cache it
    cached.conn = await cached.promise
  } catch (e) {
    // If the connection fails, reset the promise cache and throw an error
    cached.promise = null
    throw e
  }

  // Return the cached connection
  return cached.conn
}

// Export the dbConnect function to be used in other parts of the application
export default dbConnect
