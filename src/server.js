// const express = require('express');
// const mongoose = require('mongoose');
// const app = require('./app');
// const config = require('./config/db');

// const PORT = process.env.PORT || 3000;

// const startServer = async () => {
//     try {
//         await config();
//         app.listen(PORT, () => {
//             console.log(`Server is running on http://localhost:${PORT}`);
//         });
//     } catch (error) {
//         console.error('Error starting the server:', error);
//     }
// };

// startServer();
const express = require('express');
const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/db');

// Use Render's PORT, fallback to 3000 for local dev
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Connect to DB
        await config();
        console.log('Database connected successfully');

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1); // Ensure Render knows the process failed
    }
};

startServer();
