const express = require("express");
const authController = require("../controllers/auth.controller.js");
const { catchError } = require("../core/catachError.js");
const { verifyAuth } = require("../middlewares/auth.js");

const authRoute = express.Router();

authRoute.route("/register").post(catchError(authController.register));
authRoute.route("/validatePhoneOTP").post(catchError(authController.validatePhoneOTP));
authRoute.route("/resendOtp").post(catchError(authController.resendOTP));
authRoute.route("/login").post(catchError(authController.login));
authRoute.route("/updatePassword").post(verifyAuth, catchError(authController.updatePassword));
authRoute.route("/resetPassword").post(catchError(authController.resetPassword));
authRoute.route("/resetPasswordOtp").post(catchError(authController.resendResetPasswordOTP));

authRoute.route("/profile").get(verifyAuth, catchError(authController.profile));

module.exports = authRoute;
