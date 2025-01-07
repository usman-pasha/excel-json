const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 5976;
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({
    dest: "uploads/", // Temporary folder for uploads
    fileFilter: (req, file, cb) => {
        const allowedTypes = /xlsx|xls/; // Only allow Excel file extensions
        const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const isValidMime =
            file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.mimetype === "application/vnd.ms-excel"

        if (isValidExt && isValidMime) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error("Only Excel files (xlsx or xls) are allowed.")); // Reject the file
        }
    },
});

// Helper function to convert Excel to JSON
const convertExcelToJson = (filePath) => {
    const workbook = XLSX.readFile(filePath);
    let result = [];

    workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, {
            defval: null, // Set default value for empty cells
        });
        result = result.concat(sheetData); // Combine all sheets into one array
    });

    return result;
};

// API endpoint to upload and convert Excel to JSON
app.post("/convert", upload.single("file"), (req, res) => {
    console.log(`Convert Method`);

    const uploadedFile = req.file;
    console.log(uploadedFile);
    if (!uploadedFile) {
        return res.status(400).json({ error: "No file uploaded." });
    }

    try {
        // Convert the uploaded Excel file to JSON
        const jsonData = convertExcelToJson(uploadedFile.path);

        // Cleanup the uploaded file after processing
        fs.unlinkSync(uploadedFile.path);
        res.status(200).send({
            message: "successfully excel to json converted",
            data: jsonData
        })
    } catch (err) {
        console.error("Error processing the file:", err.message);

        // Cleanup the uploaded file in case of error
        if (fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path);
        }

        res.status(500).json({ error: "Failed to process the file. Please try again." });
    }
});

// Error handling middleware for better UX
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(400).json({ error: err.message });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
