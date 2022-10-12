const mongoose = require("mongoose");

const collection = "Files";

const FilesSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileKey: {
      type: String,
      default: null,
    },
    fileContentType: {
      type: String,
    },
    fileDescription: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
  },
  { timestamps: true }
);

FilesSchema.index({});

const Files = mongoose.model(collection, FilesSchema);

module.exports = Files;
