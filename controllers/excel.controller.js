const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const responser = require("../core/responser.js");
const AppError = require("../core/appError.js");
const logger = require("../utility/log.js");
const adaniModel = require("../models/adani.model.js")
const apraavaEnergyModel = require("../models/apraavaEnergy.model.js")
const polarisModel = require("../models/polaris.model.js")
const intelliSmartModel = require("../models/intelliSmart.model.js")

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

const calculateSummary = (data) => {
    let totalReceived = 0, totalDefect = 0, totalAllocated = 0;

    data.forEach(item => {
        totalReceived += item['Total Meter  Recived from Client'] || 0;
        totalDefect += item['Defect Meters Return to Client'] || 0;
        totalAllocated += item['Meter allocated to vendor'] || 0;
    });

    // Calculate remaining stock
    let remainingStock = totalReceived - totalAllocated;

    return {
        "Total Meter Received from Client": totalReceived,
        "Defect Meters Returned to Client": totalDefect,
        "Meter Allocated to Vendor": totalAllocated,
        "Remaining Stock at Vendor": remainingStock
    };
};

// upload adani excel data 
module.exports.adaniUploadExcel = async (req, res) => {
    logger.info(`Adani Method Calling`)
    const uploadedFile = req.file;
    if (!uploadedFile) {
        throw new AppError(400, "No file uploaded.");
    }
    try {
        // Convert the uploaded Excel file to JSON
        const jsonData = convertExcelToJson(uploadedFile.path);
        const calculateData = calculateSummary(jsonData)
        const mappedData = {
            totalMeterReceivedfromClient: calculateData['Total Meter Received from Client'],
            defectMetersReturnedToClient: calculateData['Defect Meters Returned to Client'],
            meterAllocatedToVendor: calculateData['Meter Allocated to Vendor'],
            remainingStockAtVendor: calculateData['Remaining Stock at Vendor'],
            location: req.body.location,
            clientName: req.body.clientName
        }
        const data = await adaniModel.create(mappedData);
        logger.info(data)
        // Cleanup the uploaded file after processing
        fs.unlinkSync(uploadedFile.path);
        return responser.send(200, `Successfully Uploaded Adani Client Data`, req, res, data);
    } catch (err) {
        logger.error("Error processing the file:", err.message)
        // Cleanup the uploaded file in case of error
        if (fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path);
        }
        return responser.send(500, `Failed to process the file. Please try again.`, req, res, err.message);
    }
};

// fetch adani excel data
module.exports.getAllAdani = async (req, res) => {
    logger.info(`Get All Adani Data`)
    const data = await adaniModel.find({});
    return responser.send(200, `Successfully Fetched Adani Data`, req, res, data);
}

// upload polaris excel data
module.exports.polarisUploadExcel = async (req, res) => {
    logger.info(`Polaris Method Calling`)
    const uploadedFile = req.file;
    if (!uploadedFile) {
        throw new AppError(400, "No file uploaded.");
    }
    try {
        // Convert the uploaded Excel file to JSON
        const jsonData = convertExcelToJson(uploadedFile.path);
        const calculateData = calculateSummary(jsonData)
        const mappedData = {
            totalMeterReceivedfromClient: calculateData['Total Meter Received from Client'],
            defectMetersReturnedToClient: calculateData['Defect Meters Returned to Client'],
            meterAllocatedToVendor: calculateData['Meter Allocated to Vendor'],
            remainingStockAtVendor: calculateData['Remaining Stock at Vendor'],
            location: req.body.location,
            clientName: req.body.clientName
        }
        const data = await polarisModel.create(mappedData);
        logger.info(data)
        // Cleanup the uploaded file after processing
        fs.unlinkSync(uploadedFile.path);
        return responser.send(200, `Successfully Uploaded Polaris Client Data`, req, res, data);
    } catch (err) {
        logger.error("Error processing the file:", err.message)
        // Cleanup the uploaded file in case of error
        if (fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path);
        }
        return responser.send(500, `Failed to process the file. Please try again.`, req, res, err.message);
    }
};

// fetch polaris excel data
module.exports.getAllPolaris = async (req, res) => {
    logger.info(`Get All Polaris Data`)
    const data = await polarisModel.find({});
    return responser.send(200, `Successfully Fetched Polaris Data`, req, res, data);
}

// upload apraavaEnergy excel data
module.exports.apraavaEnergyUploadExcel = async (req, res) => {
    logger.info(`Apraava Energy Method Calling`)
    const uploadedFile = req.file;
    if (!uploadedFile) {
        throw new AppError(400, "No file uploaded.");
    }
    try {
        // Convert the uploaded Excel file to JSON
        const jsonData = convertExcelToJson(uploadedFile.path);
        const calculateData = calculateSummary(jsonData)
        const mappedData = {
            totalMeterReceivedfromClient: calculateData['Total Meter Received from Client'],
            defectMetersReturnedToClient: calculateData['Defect Meters Returned to Client'],
            meterAllocatedToVendor: calculateData['Meter Allocated to Vendor'],
            remainingStockAtVendor: calculateData['Remaining Stock at Vendor'],
            location: req.body.location,
            clientName: req.body.clientName
        }
        const data = await apraavaEnergyModel.create(mappedData);
        logger.info(data)
        // Cleanup the uploaded file after processing
        fs.unlinkSync(uploadedFile.path);
        return responser.send(200, `Successfully Uploaded Apraava Energy Client Data`, req, res, data);
    } catch (err) {
        logger.error("Error processing the file:", err.message)
        // Cleanup the uploaded file in case of error
        if (fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path);
        }
        return responser.send(500, `Failed to process the file. Please try again.`, req, res, err.message);
    }
};

// fetch apraavaEnergy excel data
module.exports.getAllApraavaEnergy = async (req, res) => {
    logger.info(`Get All Apraava Energy Data`)
    const data = await apraavaEnergyModel.find({});
    return responser.send(200, `Successfully Fetched Apraava Energy Data`, req, res, data);
}

// upload intelliSmart excel data
module.exports.intelliSmartUploadExcel = async (req, res) => {
    logger.info(`Intelli Smart Method Calling`)
    const uploadedFile = req.file;
    console.log(uploadedFile);

    if (!uploadedFile) {
        throw new AppError(400, "No file uploaded.");
    }
    try {
        // Convert the uploaded Excel file to JSON
        const jsonData = convertExcelToJson(uploadedFile.path);
        const calculateData = calculateSummary(jsonData)
        const mappedData = {
            totalMeterReceivedfromClient: calculateData['Total Meter Received from Client'],
            defectMetersReturnedToClient: calculateData['Defect Meters Returned to Client'],
            meterAllocatedToVendor: calculateData['Meter Allocated to Vendor'],
            remainingStockAtVendor: calculateData['Remaining Stock at Vendor'],
            location: req.body.location,
            clientName: req.body.clientName
        }
        const data = await intelliSmartModel.create(mappedData);
        logger.info(data)
        // Cleanup the uploaded file after processing
        fs.unlinkSync(uploadedFile.path);
        return responser.send(200, `Successfully Uploaded Intelli Smart Client Data`, req, res, data);
    } catch (err) {
        logger.error("Error processing the file:", err.message)
        // Cleanup the uploaded file in case of error
        if (fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path);
        }

        return responser.send(500, "Failed to process the file. Please try again.", req, res, err.message);
    }
};

// fetch intelliSmart excel data 
module.exports.getAllIntelliSmart = async (req, res) => {
    logger.info(`Get All IntelliSmart Data`)
    const data = await intelliSmartModel.find({});
    return responser.send(200, `Successfully Fetched Intelli Smart Data`, req, res, data);
}