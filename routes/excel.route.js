const express = require("express")
const excelController = require("../controllers/excel.controller");
const excelRouter = express.Router();
const { catchError } = require("../core/catachError.js");
const { verifyAuth, authorizePermissions } = require("../middlewares/auth.js");

excelRouter.use(verifyAuth)
// adani 
excelRouter.post("/adani/create", authorizePermissions("adani","admin"), excelController.upload.single("file"), catchError(excelController.adaniUploadExcel))
excelRouter.get("/adani/get", authorizePermissions("adani","admin"), catchError(excelController.getAllAdani))

// intelliSmart
excelRouter.post("/intelliSmart/create", authorizePermissions("intelliSmart","admin"), excelController.upload.single("file"), catchError(excelController.intelliSmartUploadExcel))
excelRouter.get("/intelliSmart/get", authorizePermissions("intelliSmart","admin"), catchError(excelController.getAllIntelliSmart))

// apraavaEnergy
excelRouter.post("/apraavaEnergy/create", authorizePermissions("apraavaEnergy","admin"), excelController.upload.single("file"), catchError(excelController.apraavaEnergyUploadExcel))
excelRouter.get("/apraavaEnergy/get", authorizePermissions("apraavaEnergy","admin"), catchError(excelController.getAllApraavaEnergy))

// polaris
excelRouter.post("/polaris/create", authorizePermissions("polaris","admin"), excelController.upload.single("file"), catchError(excelController.polarisUploadExcel))
excelRouter.get("/polaris/get", authorizePermissions("polaris","admin"), catchError(excelController.getAllPolaris))

module.exports = excelRouter;