const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const config = require("../config");
const { promisify } = require("util");
const { hashSync, compareSync } = bcryptjs;

module.exports.signToken = (id, type) => {
    try {
        let validity;
        let secretKey;
        switch (type) {
            case "access":
                validity = config.ACCESS_VALIDITY;
                secretKey = config.ACCESS_SECRET;
                break;
            case "refresh":
                validity = config.REFRESH_VALIDITY;
                secretKey = config.REFRESH_SECRET;
                break;
            default:
                throw new Error("Invalid Token Type");
        }
        const token = jwt.sign({ id }, secretKey, {
            expiresIn: validity,
            audience: "usman",
        });
        return token;
    } catch (err) {
        throw new Error(err.message);
    }
};

module.exports.hashPassword = (password) => {
    return hashSync(password, 10);
};

module.exports.compareHashPassword = (password, hashedPassword) => {
    return compareSync(password, hashedPassword);
};

module.exports.verifyToken = async (token, type) => {
    let secret;
    switch (type) {
        case "access":
            secret = config.ACCESS_SECRET;
            break;
        case "refresh":
            secret = config.REFRESH_SECRET;
            break;
        default:
            throw new Error("Invalid Access Token Type");
    }
    try {
        return await promisify(jwt.verify)(token, secret);
    } catch (error) {
        console.error("Token verification failed");
        throw error;
    }
};
