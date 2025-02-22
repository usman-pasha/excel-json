const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const config = require("../config");

module.exports.verifyAuth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token)
            return res.status(401).send({ message: "Authorization Token Required" });

        const decodedToken = jwt.verify(token, config.ACCESS_SECRET);
        const user = await userModel.findOne(
            { _id: decodedToken?.id },
            { username: 1, _id: 1 }
        );

        if (!user)
            return res.status(401).send({ message: "User Not Found. Invalid user" });

        req.user = user;
        req.userId = decodedToken?.id;
        next();
    } catch (error) {
        return res.status(401).send({ message: error.message });
    }
};
