const mongoose = require("mongoose");

module.exports.db = async (url) => {
    console.log(`Connecting to db`);
    try {
        const connection = await mongoose.connect(url);
        console.log(`Successfully connected to mongo db server!`);
        return connection;
    } catch (error) {
        console.log(error);
        
        throw new Error(
            "Mongodb connection failed plz check the connection string"
        );
    }
};
