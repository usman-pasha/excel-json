const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

module.exports.upload = multer({
    dest: "./uploads/", // Temporary folder for uploads
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

// app.post("/convert", upload.single("file"), (req, res) => {
module.exports.excelToJsonController = async (req, res) => {
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
};