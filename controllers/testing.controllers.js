const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const excelModel = require("../models/excel.model");

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
// const convertExcelToJson = (filePath) => {
//     const workbook = XLSX.readFile(filePath);
//     let result = [];

//     workbook.SheetNames.forEach((sheetName) => {
//         const worksheet = workbook.Sheets[sheetName];
//         const sheetData = XLSX.utils.sheet_to_json(worksheet, {
//             defval: null, // Set default value for empty cells
//         });
//         result = result.concat(sheetData); // Combine all sheets into one array
//     });

//     return result;
// };

// const convertExcelToJson = (filePath) => {
//     const workbook = XLSX.readFile(filePath);
//     let result = [];

//     workbook.SheetNames.forEach((sheetName) => {
//         const worksheet = workbook.Sheets[sheetName];
//         const sheetData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

//         // Transform data into the required format
//         const formattedData = sheetData.map((row, index) => ({
//             "Sl.No": index + 1, // Auto-generate serial number
//             "Date": row["Date"] || null,
//             "Location": row["Location"] || null,
//             "Make of Meter": row["Make of Meter"] || null,
//             "Type of Meter(1PH & 3PH)": row["Type of Meter(1PH & 3PH)"] || null,
//             "Total Meter Recived from Client": row["Total Meter Recived from Client"] || 0,
//             "Defect Meters Return to Client": row["Defect Meters Return to Client"] || 0,
//             "Meter allocated to vendor": row["Meter allocated to vendor"] || 0,
//             "Remaining Stock at Vendor": row["Remaining Stock at Vendor"] || 0,
//         }));

//         result = result.concat(formattedData);
//     });

//     return result;
// };

const convertExcelToJson = (filePath) => {
    const workbook = XLSX.readFile(filePath);
    let result = [];

    workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        let sheetData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

        if (sheetData.length > 0) {
            // Extract headers from the first row, handling null values
            const headers = Object.values(sheetData[0]).map((header) =>
                header ? header.toString().trim() : "Unknown_Column"
            );

            // Convert the rest of the rows into structured JSON
            const formattedData = sheetData.slice(1).map((row) => {
                let newRow = {};
                Object.keys(row).forEach((key, index) => {
                    newRow[headers[index] || `Column_${index}`] = row[key]; // Default column name if missing
                });
                return newRow;
            });

            result = result.concat(formattedData);
        }
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
        console.log(jsonData);
        const mappedData = jsonData.map(row => ({
            Date: row.Date || null,
            Location: row.Location || null,
            MakeOfMeter: row["Make of Meter"] || null,
            TypeOfMeter: row["Type of Meter(1PH & 3PH)"] || null,
            TotalMeterReceivedFromClient: row["Total Meter  Recived from Client"] || 0,
            DefectMetersReturnToClient: row["Defect Meters Return to Client"] || 0,
            MeterAllocatedToVendor: row["Meter allocated to vendor"] || 0,
            RemainingStockAtVendor: row["Remaining Stock at Vendor"] || 0,
        }));

        await excelModel.create(mappedData);
        const data = jsonData
        let totalReceived = 0;
        let totalDefect = 0;
        let totalAllocated = 0;

        // Sum all required fields
        data.forEach(item => {
            totalReceived += item['Total Meter  Recived from Client'] || 0;
            totalDefect += item['Defect Meters Return to Client'] || 0;
            totalAllocated += item['Meter allocated to vendor'] || 0;
        });

        // Calculate remaining stock
        let remainingStock = totalReceived - totalAllocated;

        const response = {
            "Total Meter Received from Client": totalReceived,
            "Defect Meters Returned to Client": totalDefect,
            "Meter Allocated to Vendor": totalAllocated,
            "Remaining Stock at Vendor": remainingStock
        };
        console.log(response);

        // Cleanup the uploaded file after processing
        fs.unlinkSync(uploadedFile.path);
        res.status(200).send({
            message: "successfully excel to json converted",
            data: response
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