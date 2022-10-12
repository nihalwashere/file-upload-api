const UserRoles = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
};

const getUserRoles = () => [UserRoles.ADMIN, UserRoles.MEMBER];

module.exports = { UserRoles, getUserRoles };
