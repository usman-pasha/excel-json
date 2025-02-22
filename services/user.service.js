const userModel= require("../models/user.model.js");
const logger = require("../utility/log.js");
const AppError = require("../core/appError.js");

exports.createrecord = async (object) => {
    const record = await userModel.create(object);
    return record;
};

exports.findOneRecord = async (conditions, select) => {
    const record = await userModel.findOne(conditions).select(select);
    return record;
};

exports.findAllRecord = async (conditions, select) => {
    const record = await userModel.find(conditions).select(select);
    return record;
};

exports.updateRecord = async (condition, body) => {
    const option = { new: true };
    const record = await userModel.findOneAndUpdate(condition, body, option);
    return record;
};

// 1. Get all bidder / auctioneer
exports.getAllBidderOrAuctioneer = async (query) => {
    logger.info(`Query ${query}`);
    let condition = {};
    if (query.account === "bidder") {
        condition = {
            accountType: "Bidder",
            status: { $ne: "deleted" },
        };
    } else if (query.account === "auctioneer") {
        condition = {
            accountType: "Auctioneer",
            status: { $ne: "deleted" },
        };
    } else {
        throw new AppError(404, "Bidder Or Auctioneer Not Found");
    }
    const users = await exports.findAllRecord(condition, "-password -__v");
    if (users.length === 0) {
        throw new AppError(404, `${query.account.toUpperCase()} Account Not Found`);
    }
    return users;
};

// 2. Get single bidder / auctioneer 
exports.getSingleBidderOrAuctioneer = async (params) => {
    logger.info(`Get Single Bidder Or Auctioneer Method Started`);
    const condition = { _id: params.id };
    if (params.id) {
        const userId = await exports.findOneRecord({
            _id: { $eq: params.id },
        });
        if (!userId) throw new AppError(404, "Bidder or Auctioneer Account Not Found");
    }
    const record = await exports.findOneRecord(condition, "-password -__v");
    return record;
};

// 3. Update bidder or auctioneer account 
exports.updateAccount = async (body) => {
    logger.info(`Update Profile Method Started`);
    if (body.userId) {
        const user = await exports.findOneRecord({
            _id: { $eq: body.userId },
        });
        if (!user) throw new AppError(404, "Bidder or Auctioneer Account Not Found");
    }

    let updateData = {};

    if (body.username) {
        const usernameIsExists = await exports.findOneRecord({
            username: body.username,
            _id: { $ne: body.userId },
        });
        if (usernameIsExists) throw new AppError(400, "User Name exists already!");
        updateData.username = body.username;
    }
    if (body.fullName) updateData.fullName = body.fullName;
    if (body.profilePicture) updateData.profilePicture = body.profilePicture;
    if (body.email) updateData.email = body.email;
    if (body.phoneNumber) updateData.phoneNumber = body.phoneNumber;

    logger.data("update-data", updateData);
    const update = await exports.updateRecord({ _id: body.userId }, updateData);
    update.password = undefined;
    return update;
};

// 4. Delete bidder or auctioneer account 
exports.deleteBidderOrAuctioneer = async (userId) => {
    logger.info(`Account Delete Method Started`);
    const condition = { _id: userId };
    const updateQuery = {
        status: "deleted",
    };
    const user = await exports.updateRecord(condition, updateQuery);
    if (!user) throw new AppError(404, "Record Not Found");
    return true;
};

exports.getForAuthentication = async (condition) => {
    const record = await userModel.findOne({ _id: condition.id }).select("-password");
    return record;
};
