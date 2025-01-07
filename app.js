const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5976;
const routes = require("./routes/index")
const path = require("path");

app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to upload and convert Excel to JSON
routes(app);

// Error handling middleware for better UX
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(400).json({ error: err.message });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
