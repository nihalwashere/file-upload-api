const UsersModel = require("../models/Users");
const { decodeJWT } = require("./jwt");

const validateToken = async (headers) => {
  const token = headers["x-access-token"];

  if (!token) {
    return { status: 401, error: true, message: "Invalid Request." };
  }

  const decodedJWT = decodeJWT(token);

  if (!decodedJWT || !decodedJWT.userId) {
    return { status: 401, error: true, message: "Invalid Token." };
  }

  const user = await UsersModel.findOne({ _id: decodedJWT.userId });

  if (!user) {
    return {
      status: 401,
      error: true,
      message: "Access denied. User does not exist.",
    };
  }

  return { error: false, userId: user._id, user };
};

module.exports = { validateToken };
