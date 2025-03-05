const mongoose = require("mongoose");
const adminData = require("./createAdmin");

const Initialise = async () => {
  try {
    const connect = await mongoose.connect("mongodb://127.0.0.1:27017/excel");
    console.log("connected to database");
    console.log("Initializing Roles");
    const db = connect.connection;
    const admins = await adminData.creatingAdmin(db);
    console.log("Admin Created");
  } catch (err) {
    console.log(err);
    return;
  }
  process.exit(0);
};
Initialise();
return;
