const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adaniSchema = new Schema(
    {
        totalMeterReceivedfromClient: { type: String, required: true },
        defectMetersReturnedToClient: { type: String, required: true },
        meterAllocatedToVendor: { type: String, required: true },
        remainingStockAtVendor: { type: String, required: true },
        location: { type: String },
        clientName: { type: String, required: true,enum:["adani"] }
    },
    { timestamps: true }
);

// ['adani', 'polaris', 'intelliSmart', 'apraavaEnergy', 'admin']

module.exports = mongoose.model("adani", adaniSchema);
