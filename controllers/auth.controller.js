const authService = require("../services/auth.service.js");
const responser = require("../core/responser.js");

class AuthController {
    // register Bidder
    async addUserByAdmin(req, res) {
        const reqData = req.body;
        const data = await authService.addUserByAdmin(reqData);
        console.log(data);
        return responser.send(201, `Successfully ${data.accountType} Register`, req, res, data);
    }

    // validatePhoneOTP
    async validatePhoneOTP(req, res) {
        const reqData = req.body;
        const data = await validatePhoneOTP(reqData);
        console.log(data);
        return responser.send(200, "Successfully Validate Phone OTP", req, res, data);
    }

    // resend
    async resendOTP(req, res) {
        const reqData = req.body;
        const data = await resendOTP(reqData);
        console.log(data);
        return responser.send(200, `Successfully ${reqData.type} OTP Sent`, req, res, data);
    }

    // login 
    async login(req, res) {
        const reqData = req.body;
        const data = await authService.login(reqData);
        console.log(data);
        return responser.send(200, `Successfully ${data.accountType} Login`, req, res, data);
    }

    // updatePassword 
    async updatePassword(req, res) {
        const reqData = req.body;
        reqData.userId = req.userId;
        const data = await updatePassword(reqData);
        console.log(data);
        return responser.send(200, "Successfully password updated", req, res, data);
    }

    // resetPassword
    async resetPassword(req, res) {
        const reqData = req.body;
        const data = await resetPassword(reqData);
        console.log(data);
        return responser.send(200, "Successfully password reset", req, res, data);
    }

    // resendResetPasswordOTP
    async resendResetPasswordOTP(req, res) {
        const reqData = req.body;
        const data = await resendResetPasswordOTP(reqData);
        console.log(data);
        return responser.send(200, "Successfully password OTP sent!", req, res, data);
    }

    // profile
    async profile(req, res) {
        const userId = req.userId;
        const data = await userAllProfiles(userId);
        console.log(data);
        return responser.send(
            200,
            `Successfully ${data.accountType} Profile Fetched`,
            req,
            res,
            data
        );
    }
}

module.exports = new AuthController();
