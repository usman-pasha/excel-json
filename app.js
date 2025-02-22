const express = require("express");
const cors = require("cors");
const app = express();
const config = require("./config/index")
const routes = require("./routes/index")
const path = require("path");
const db = require("./core/db")

app.use(cors())
app.use(express.json())
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
app.listen(config.PORT, async() => {
    console.log(`Server is running on http://localhost:${config.PORT}`);
    await db.db(config.MONGO_URI)
});
