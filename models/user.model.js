const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        fullName: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        emailOTP: { type: Number },
        emailIsVerified: { type: Boolean, default: false },
        emailOtpExpiry: { type: Date },
        phoneNumber: { type: Number, required: true, unique: true },
        phoneOTP: { type: Number },
        phoneIsVerified: { type: Boolean, default: false },
        phoneOtpExpiry: { type: Date },
        password: { type: String, required: true },
        accountType: {
            type: String, required: true,
            enum: ['adani', 'polaris', 'intelliSmart', 'apraavaEnergy', 'admin']
        },
        profilePicture: { type: String },
        resetPasswordPhoneOtp: { type: Number },
        resetPasswordExpire: { type: Date },
        resetPasswordEmailOtp: { type: Number },
        status: { type: String, enum: ["active", "inactive", "deleted"], default: "active" },
    },
    { timestamps: true }
);

userSchema.index({ email: true });

module.exports = mongoose.model("user", userSchema);
