const jsonData = require("./createAdmin.json");
const bcrypt = require("bcryptjs");

module.exports.creatingAdmin = async (connection) => {
  try {
    const admins = JSON.parse(JSON.stringify(jsonData.admins));
    for (const admin of admins) {
      const isExist = await connection
        .collection("users")
        .findOne({ username: admin.username });
      if (isExist) {
        console.log("Already Admin =", admin.username, "Exists");
        continue;
      }
      const date = new Date().toISOString();
      const password = bcrypt.hashSync(admin.password, 10);
      const object = {
        fullName: admin.fullName,
        username: admin.username,
        email: admin.email,
        emailIsVerified: admin.emailIsVerified,
        phoneNumber: admin.phoneNumber,
        phoneIsVerified: admin.phoneIsVerified,
        password: password,
        accountType: admin.accountType,
        profilePicture: admin.profilePicture,
        status: admin.status,
        createdAt: date,
        updatedAt: date
      };
      const insert = await connection.collection("users").insertMany([object]);
      console.log("Saved Admin", admin.username);
    }
  } catch (err) {
    console.log(err);
    return;
  }
};

