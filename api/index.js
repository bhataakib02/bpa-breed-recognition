// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const path = require('path');

// Create a new Express app for Vercel
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import and use your existing server routes
const serverApp = require('../backend/src/server');

// Mount the server app
app.use('/', serverApp);

// Export for Vercel
module.exports = app;
