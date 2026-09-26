import mongoose from "mongoose";

const girviRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      match: /^[6-9][0-9]{9}$/,
    },

    item: {
      type: String,
      required: true,
      trim: true,
    },

    registrationDate: {
      type: Date,
      required: true,
    },

    closingDate: {
      type: Date,
      default: null,
    },

    otherDetails: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const GirviRecord = mongoose.model(
  "GirviRecord",
  girviRecordSchema
);

export default GirviRecord;