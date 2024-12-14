import { MongoClient, ObjectId } from "mongodb";
import Database from "../db";

class MongoDB extends Database {
  static client = null; // Shared MongoClient instance
  static db = null; // Shared database instance

  constructor(uri) {
    super();
    if (typeof window !== "undefined") {
      throw new Error("MongoDB operations are not supported on the client side.");
    }
    this.uri = uri;
    this.dbName = process.env.DB_NAME || "default_db"; // Use DB_NAME from environment variables
  }

  /**
   * Connect to the MongoDB database. Reuses an existing connection if available.
   */
  async connect() {
    if (!MongoDB.client || !MongoDB.client.topology?.isConnected()) {
      try {
        console.log("Establishing new MongoDB connection...");
        MongoDB.client = new MongoClient(this.uri, {
          tls: true, // Ensure TLS is enabled for secure connections
          tlsAllowInvalidCertificates: false, // Only for development/self-signed certificates
          serverSelectionTimeoutMS: 5000, // Timeout for selecting servers
        });
  
        await MongoDB.client.connect();
        MongoDB.db = MongoDB.client.db(this.dbName); // Use the database name from DB_NAME
        console.log(`MongoDB connected to database: ${this.dbName}`);
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new Error("Failed to connect to MongoDB.");
      }
    } else {
      console.log("Using existing MongoDB connection.");
    }
  }
  

  /**
   * Verify the database connection before performing operations.
   */
  async verifyConnection() {
    if (!MongoDB.client || !MongoDB.client.topology.isConnected()) {
      console.error("MongoDB client is not connected.");
      throw new Error("MongoDB client is not connected. Please ensure the connection is established.");
    }
    if (!MongoDB.db) {
      console.error(`Database "${this.dbName}" is not selected.`);
      throw new Error(`Database "${this.dbName}" is not selected.`);
    }
  }

    /**
   * Fetch data from a specific collection based on a query.
   * @param {string} collection - The name of the collection.
   * @param {object|array} query - The MongoDB query object or an array (e.g., from Firebase-style queries).
   * @returns {Promise<Array>} - The resulting documents as an array.
   */
    async get(collection, queryConditions = [], fields = []) {
      try {
        await this.connect();
        await this.verifyConnection();
    
        // Convert query conditions (like Firestore) into MongoDB query
        const mongoQuery = this.convertQueryConditionsToMongoQuery(queryConditions);
        console.log(mongoQuery);
        // Convert fields array into a projection object
        let projection = {};
        if (fields.length > 0) {
          projection = fields.reduce((proj, field) => {
            proj[field] = 1;
            return proj;
          }, {});
          // Uncomment if you don't want _id field by default:
          // projection._id = 0; 
        }
    
        console.log("running mongodb get with fields:", fields);
        const results = await MongoDB.db.collection(collection).find(mongoQuery, { projection }).toArray();
        console.log(`Fetched ${results.length} documents from collection "${collection}".`);
        return results;
      } catch (error) {
        console.error(`Error fetching data from collection "${collection}":`, error);
        throw new Error("Failed to fetch data.");
      }
    }
  

  /**
   * Insert data into a specific collection.
   * @param {string} collection - The name of the collection.
   * @param {object} data - The data to be inserted.
   * @returns {Promise<object>} - The result of the insertion.
   */
  async insert(collection, data) {
    try {
      await this.connect(); // Ensure the connection is established
      await this.verifyConnection(); // Verify connection before inserting
      const result = await MongoDB.db.collection(collection).insertOne(data);
      console.log(`Inserted data into collection "${collection}":`, result.insertedId);
      return result;
    } catch (error) {
      console.error(`Error inserting data into collection "${collection}":`, error);
      throw new Error("Failed to insert data.");
    }
  }

  async update(collection, id, data) {
    try {
      await this.connect(); // Ensure the connection is established
      await this.verifyConnection(); // Verify connection before updating
      var ObjectID = require("bson-objectid");
      
      const result = await MongoDB.db.collection(collection).updateOne(
        { _id:  ObjectID(id) }, // Convert string ID to ObjectId
        { $set: data }
      );
      console.log(`Updated document with ID "${id}" in collection "${collection}":`, result.modifiedCount);
      return result;
    } catch (error) {
      console.error(`Error updating document with ID "${id}" in collection "${collection}":`, error);
      throw new Error("Failed to update document.");
    }
  }

  async remove(collection, id) {
    try {
      await this.connect(); // Ensure the connection is established
      await this.verifyConnection(); // Verify connection before updating
      var ObjectID = require("bson-objectid");
      
      if(collection === "settings"){
        throw Error("You can't do that");
      }

      const result = await MongoDB.db.collection(collection).deleteOne(
        { _id:  ObjectID(id) } // Convert string ID to ObjectId
      );
      if (result.deletedCount === 1) {
        console.log(`Successfully removed document with ID "${id}" from collection "${collection}".`);
      } else {
        console.log(`No document found with ID "${id}" in collection "${collection}".`);
      }
      return result;
    } catch (error) {
      console.error(`Error updating document with ID "${id}" in collection "${collection}":`, error);
      throw new Error("Failed to update document.");
    }
  }


  /**
   * Close the database connection.
   * This will only close the connection if it was explicitly initiated in this instance.
   */
  async close() {
    if (MongoDB.client) {
      try {
        await MongoDB.client.close();
        console.log("MongoDB connection closed.");
        MongoDB.client = null; // Reset the shared client
        MongoDB.db = null; // Reset the shared database
      } catch (error) {
        console.error("Error closing MongoDB connection:", error);
      }
    }
  }


  // Add this helper method inside the same MongoDB class
  convertQueryConditionsToMongoQuery(queryConditions) {


    if (!Array.isArray(queryConditions) || queryConditions.length === 0) {
      return {};
    }
  
    const mongoQuery = {};
  
    for (const condition of queryConditions) {
      let [field, operator, value] = condition;
  
      // For MongoDB, map 'id' to '_id' and try to convert to ObjectId if valid
      if (field === "id") {
        field = "_id";
        console.log(value);
        if ((typeof value === "string") && ObjectId.isValid(value)) {
          value = new ObjectId(value);
        }
      }
  
      switch (operator) {
        case "==":
          mongoQuery[field] = value;
          break;
        case ">":
          mongoQuery[field] = { $gt: value };
          break;
        case ">=":
          mongoQuery[field] = { $gte: value };
          break;
        case "<":
          mongoQuery[field] = { $lt: value };
          break;
        case "<=":
          mongoQuery[field] = { $lte: value };
          break;
        case "!=":
          mongoQuery[field] = { $ne: value };
          break;
        case "in":
          mongoQuery[field] = { $in: value };
          break;
        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }
    }
  
    return mongoQuery;
  }
  
}

export default MongoDB;