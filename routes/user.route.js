const express = require("express");
const userController = require("../controllers/user.controller.js");
const { catchError } = require("../core/catachError.js");
const { verifyAuth } = require("../middlewares/auth.js");

const userRoute = express.Router();

userRoute.route("/getForAuthentication").get(catchError(userController.getForAuthentication));
userRoute.route("/getAllBidderOrAuctioneer").get(catchError(userController.getAllBidderOrAuctioneer));
userRoute.route("/getSingleBidderOrAuctioneer/:id").get(catchError(userController.getSingleBidderOrAuctioneer));
userRoute.route("/updateAccount").patch(verifyAuth, catchError(userController.updateAccount));
userRoute.route("/deleteBidderOrAuctioneer").delete(verifyAuth, catchError(userController.deleteBidderOrAuctioneer));

module.exports = userRoute;
