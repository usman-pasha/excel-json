const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const excelSchema = new Schema(
    {
        Date: { type: String },
        Location: { type: String },
        MakeOfMeter: { type: String },
        TypeOfMeter: { type: String },
        TotalMeterReceivedFromClient: { type: String },
        DefectMetersReturnToClient: { type: String },
        MeterAllocatedToVendor: { type: String },
        RemainingStockAtVendor: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Excel", excelSchema);
