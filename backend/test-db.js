const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Successfully connected to MongoDB Atlas!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to connect:', err);
        process.exit(1);
    }
};

testConnection();
