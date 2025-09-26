// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import your existing server
const app = require('../backend/src/server');

// Export for Vercel
module.exports = app;
