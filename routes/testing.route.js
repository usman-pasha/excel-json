const express = require("express")
const testingController = require("../controllers/testing.controllers");
const testingRouter = express.Router()

testingRouter.route("/convert")
    .post(testingController.upload.single("file"), testingController.excelToJsonController)

module.exports = testingRouter;