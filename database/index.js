/**
 * database/index.js
 * -----------------
 * Sets up and exports the PostgreSQL connection pool for the application.
 * Handles different configurations for development and production environments.
 * Provides a query wrapper for logging and error handling in development.
 *
 * Author: Roque A Pulido
 * Date: Jun 18, 2025
 */

const { Pool } = require("pg");
require("dotenv").config();
/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 *
 * In development: uses SSL and logs queries for debugging.
 * In production: uses default connection.
 * *************** */
let pool;
if (process.env.NODE_ENV == "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  // Added for troubleshooting queries
  // during development
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params);
        console.log("executed query", { text });
        return res;
      } catch (error) {
        console.error("error in query", { text });
        throw error;
      }
    },
  };
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  module.exports = pool;
}
