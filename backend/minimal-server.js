require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Simple health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running - MINIMAL VERSION'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ MINIMAL SERVER RUNNING on http://0.0.0.0:${PORT}`);
});
