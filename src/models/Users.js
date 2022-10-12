const mongoose = require("mongoose");

const collection = "Users";

const { getUserRoles } = require("../constants/UserRoles");

const { Schema } = mongoose;

const UsersSchema = new Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      index: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: getUserRoles(),
    },
  },
  { timestamps: true }
);

const Users = mongoose.model(collection, UsersSchema);

module.exports = Users;
