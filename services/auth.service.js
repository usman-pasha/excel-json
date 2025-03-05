const userService = require("./user.service.js")
const { hashPassword, compareHashPassword } = require("../middlewares/token.js");
const AppError = require("../core/appError.js");
const { createLogin } = require("./token.service.js");
const { generateOTP } = require("../utility/utils.js");
const logger = require("../utility/log.js");
const tokenService = require("./token.service.js");

// 1. Register 
exports.addUserByAdmin = async (body) => {
    logger.info(`Creating User in Auth Service`);
    if (!body.username || !body.email || !body.password || !body.phoneNumber) {
        throw new AppError(404, "Required Parameters");
    }
    if (!body.accountType) {
        throw new AppError(404, "Required AccountType");
    }
    const user = await userService.findOneRecord(
        { $or: [{ phoneNumber: body.phoneNumber }, { email: body.email }] },
        "-password"
    );
    if (user) throw new AppError(404, "User Email or phoneNumber already exists");

    const payload = {};

    if (body.username) payload.username = body.username;
    if (body.email) payload.email = body.email;
    if (body.fullName) payload.fullName = body.fullName;
    if (body.phoneNumber) payload.phoneNumber = Number(body.phoneNumber);
    if (body.password) payload.password = hashPassword(body.password);
    const allowedAccountTypes = ['adani', 'polaris', 'intelliSmart', 'apraavaEnergy'];
    if (body.accountType && allowedAccountTypes.includes(body.accountType)) {
        payload.accountType = body.accountType;
    } else {
        throw new AppError(400, `Invalid accountType received: ${body.accountType}`);
    }
    const createUser = await userService.createrecord(payload);
    const record = await userService.findOneRecord(
        { _id: createUser?._id },
        "-password -__v -createdAt -updatedAt -phoneOtpExpiry -emailOtpExpiry"
    );
    return record;
};

// 2. Verify Phone OTP
exports.validatePhoneOTP = async (body) => {
    logger.info("Validate Phone OTP");
    const filter = { phoneNumber: body.phoneNumber };
    const user = await userService.findOneRecord(filter);
    if (!user) throw new AppError(404, "User not found. Register first!");

    if (!body.phoneOTP || !body.phoneNumber) {
        throw new AppError(404, "Please provide phoneNumber and phoneOTP!");
    }

    if (Date.now() > user.phoneOtpExpiry) {
        await userService.updateRecord({ _id: user._id }, { $unset: { phoneOTP: "" } });
        throw new AppError(404, "OTP has expired. Try to resend OTP!");
    }

    if (body.phoneOTP !== String(user.phoneOTP)) {
        throw new AppError(404, "Invalid OTP. Try again!");
    }

    await userService.updateRecord({ _id: user._id }, {
        $set: { phoneIsVerified: true, status: "active" },
        $unset: { phoneOTP: "", phoneOtpExpiry: "" }
    });

    return `OTP validation successful for ${user.phoneNumber}!`;
};

// 3. Resend OTP
exports.resendOTP = async (body) => {
    logger.info("START: Resend OTP");

    const newOtp = generateOTP();
    const newExpiry = Date.now() + 5 * 60 * 1000;
    let filter = {};
    let updateFields = {};

    switch (body.type) {
        case "phone":
            filter.phoneNumber = body.phoneNumber;
            updateFields = { $set: { phoneOTP: newOtp, phoneOtpExpiry: newExpiry } };
            break;
        case "email":
            filter.email = body.email;
            updateFields = { $set: { emailOTP: newOtp, emailOtpExpiry: newExpiry } };
            break;
        default:
            throw new AppError(404, "Invalid type! Provide 'phone' or 'email'.");
    }

    const user = await userService.findOneRecord(filter);
    if (!user) throw new AppError(404, "User not found. Register first!");

    await userService.updateRecord({ _id: user._id }, updateFields);
    return `Successfully sent new OTP to ${body.type === 'phone' ? user.phoneNumber : user.email}!`;
};

// 4. Login
exports.login = async (body) => {
    logger.info("Login Service Started");

    if (!body.phoneNumber || !body.password) {
        throw new AppError(404, "Phone Number and Password are required.");
    }

    const user = await userService.findOneRecord({ phoneNumber: body.phoneNumber });
    if (!user) throw new AppError(400, "User not found with the provided phone number.");

    if (user.status === "deleted") {
        throw new AppError(400, "User account is deleted. Contact admin.");
    }

    // if (!user.phoneIsVerified) {
    //     throw new AppError(400, "Phone number is not verified.");
    // }

    const isPasswordValid = compareHashPassword(body.password, user.password);
    if (!isPasswordValid) {
        throw new AppError(400, "Invalid password. Try again.");
    }

    const loginToken = await createLogin(user);
    logger.info(`User ${user.phoneNumber} logged in successfully.`);
    return loginToken;
};

// 5. Update Password
exports.updatePassword = async (body) => {
    logger.info("Password Update Service Started");

    const { currentPassword, newPassword, userId } = body;
    if (!currentPassword || !newPassword) {
        throw new AppError(400, "Current and new passwords are required.");
    }

    const user = await userService.findOneRecord({ _id: userId });
    if (!user) throw new AppError(404, "User not found.");

    const isPasswordValid = compareHashPassword(currentPassword, user.password);
    if (!isPasswordValid) throw new AppError(400, "Current password is incorrect.");

    const hashedNewPassword = hashPassword(newPassword);
    await userService.updateRecord({ _id: userId }, { $set: { password: hashedNewPassword } });

    logger.info(`User ${user.phoneNumber || user.email} updated their password successfully.`);
    return "Password updated successfully.";
};

// 6. Reset Password
exports.resetPassword = async (body) => {
    logger.info("Password Reset Service Started");

    const { identifier, otp, newPassword, type } = body;
    if (!identifier || !otp || !newPassword || !type) {
        throw new AppError(400, "Identifier, OTP, new password, and type are required.");
    }

    let filter = {};
    let otpField = '';
    let otpExpiryField = '';

    if (type === 'phone') {
        filter.phoneNumber = identifier;
        otpField = 'resetPasswordPhoneOtp';
        otpExpiryField = 'resetPasswordExpire';
    } else if (type === 'email') {
        filter.email = identifier;
        otpField = 'resetPasswordEmailOtp';
        otpExpiryField = 'resetPasswordExpire';
    } else {
        throw new AppError(400, "Invalid type. Provide 'phone' or 'email'.");
    }

    const user = await userService.findOneRecord(filter);
    if (!user) throw new AppError(404, `User not found with the provided ${type}.`);

    if (Date.now() > user[otpExpiryField]) {
        throw new AppError(400, "OTP has expired.");
    }

    if (String(user[otpField]) !== String(otp)) {
        throw new AppError(400, "Invalid OTP.");
    }

    const hashedNewPassword = hashPassword(newPassword);
    await userService.updateRecord({ _id: user._id }, {
        $set: { password: hashedNewPassword },
        $unset: { [otpField]: "", [otpExpiryField]: "" }
    });

    logger.info(`User ${user.phoneNumber || user.email} reset their password successfully.`);
    return "Password reset successfully.";
};

// 7. Resend Reset Password OTP
exports.resendResetPasswordOTP = async (body) => {
    logger.info("Resend Reset Password OTP Service Started");

    const { identifier, type } = body;
    if (!identifier || !type) {
        throw new AppError(400, "Identifier and type are required.");
    }

    let filter = {};
    let otpField = '';
    let otpExpiryField = '';

    if (type === 'phone') {
        filter.phoneNumber = identifier;
        otpField = 'resetPasswordPhoneOtp';
        otpExpiryField = 'resetPasswordExpire';
    } else if (type === 'email') {
        filter.email = identifier;
        otpField = 'resetPasswordEmailOtp';
        otpExpiryField = 'resetPasswordExpire';
    } else {
        throw new AppError(400, "Invalid type. Provide 'phone' or 'email'.");
    }

    const user = await userService.findOneRecord(filter);
    if (!user) throw new AppError(404, `User not found with the provided ${type}.`);

    const newOtp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    await userService.updateRecord({ _id: user._id }, {
        $set: { [otpField]: newOtp, [otpExpiryField]: otpExpiry }
    });

    return `OTP sent successfully to ${identifier}.`;
};

// 8. User Profile
exports.userAllProfiles = async (loggedInUser) => {
    const condition = { _id: loggedInUser };
    logger.info(condition);
    const user = await userService.findOneRecord(condition, "-password -__v");
    return user;
};
