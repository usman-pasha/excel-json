const tokenModel= require("../models/token.model.js");
const { signToken: generateToken } = require("../middlewares/token.js");
const jwt = require("jsonwebtoken");
const { Types } = require("mongoose"); // for ObjectId
const config = require("../config/index.js");

exports.createLogin = async (user) => {
    console.log("inside login response");
    const id = user._id;
    const payload = {
        user: id,
        jwtToken: generateToken(id, "access"),
        refreshToken: generateToken(id, "refresh"),
    };
    const token = await tokenModel.create(payload);
    const totalCount = await tokenModel.countDocuments({ user: token.user });
    const record = {
        totalLogin: totalCount,
        token: token?.jwtToken,
        refreshToken: token?.refreshToken,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        fullName: user?.fullName,
        username: user?.username,
        accountType: user?.accountType,
        _id: user?._id,
    };
    return record;
};

exports.findOneToken = async (tokenId) => {
    const token = await tokenModel.findOne(tokenId);
    return token;
};

exports.deleteToken = async (tokenId) => {
    const token = await tokenModel.findByIdAndDelete(tokenId);
    return token;
};

exports.updateToken = async (id, updatedata) => {
    const record = await tokenModel.findOneAndUpdate(id, updatedata, {
        new: true,
    });
    return record;
};

exports.signToken = async (id) => {
    const token = jwt.sign({ id }, config.ACCESS_SECRET, {
        expiresIn: 900, // expires in 15 minutes
    });
    return token;
};

exports.tokenVerify = async (token) => {
    const record = jwt.verify(token, config.ACCESS_SECRET);
    return record;
};

exports.refreshToken = async (id) => {
    const token = jwt.sign({ id }, config.REFRESH_SECRET, {
        expiresIn: "30d",
    });
    return token;
};
