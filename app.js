// Import required packages
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

// Create the Express app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const connectionUrl = 'mongodb+srv://smartmilk23:Smartmilk23@cluster0.w01ojve.mongodb.net/';
const databaseName = 'smartmilk'; // Replace with your preferred database name

// Connect to MongoDB
mongoose.connect(connectionUrl + databaseName, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
// Get the default connection
const db = mongoose.connection;

// Log MongoDB connection events
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

db.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

db.on('reconnected', () => {
  console.log('Reconnected to MongoDB');
});
// mongoose.set('useCreateIndex', true);

// Configure express-session
app.use(
  session({
    secret: 'mysecretkey',
    resave: true,
    saveUninitialized: true
  })
);

// Import routes
const userRoutes = require('./routes/user');

// Use routes
app.use('/', userRoutes);

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
