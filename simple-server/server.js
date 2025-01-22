const express = require('express');
const app = express();
const port = 8000;

app.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
});

app.get('/health', (req, res) => {
    res.send(`Health Route from ${port}`);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});