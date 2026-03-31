const userService = require("../services/userService");

const handleLogin = async (req, res) => {
  // const { email, password } = req.body;
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    return res.status(400).json({
      errCode: 1,
      message: `Email or password are required`,
    });
  }

  const userData = await userService.handleUserLogin(email, password);

  return res.status(200).json({
    errCode: userData.errCode,
    message: userData.errMessage,
    user: userData ? userData.user : {},
    token: userData ? userData.token : {},
  });
};

const getUserById = async (req, res) => {
  let id = req.params.id;
  const user = await userService.getUserById(id);
  return res.status(200).json({
    user,
  });
};

const getAllUsers = async (req, res) => {
  let id = req.body.id;

  const users = await userService.getUsers(id);

  return res.status(200).json({
    users,
  });
};

const hanbleUserRegister = async (req, res) => {
  let { email, password, fullname } = req.body;
  if (!email || !password || !fullname) {
    return res.status(400).json({
      errCode: 1,
      message: `Email, password and fullname are required`,
    });
  }
  const registerData = await userService.hanbleUserRegister(
    email,
    password,
    fullname
  );

  return res.status(200).json({
    errCode: registerData.errCode,
    message: registerData.errMessage,
    user: registerData.user ? registerData.user : {},
  });
};

const updateUser = async (req, res) => {
  let id = req.body.id;
  let data = req.body;
  const updatedUser = await userService.updateUser(id, data);
  return res.status(200).json({
    user: updatedUser,
  });
};

const updateUserPassword = async (req, res) => {
  let id = req.body.id;
  let password = req.body.password;
  let check = await userService.checkUserPassword(id, password);
  if (!check) {
    return res.status(400).json({
      errCode: 1,
      message: "Wrong password",
    });
  } else {
    const updatedUser = await userService.updateUserPassword(id, password);
    return res.status(200).json({
      user: updatedUser,
    });
  }
};

const handleForgotPassword = async (req, res) => {
  let email = req.body.email;
  if (!email) {
    return res.status(400).json({
      errCode: 1,
      message: "Email is required",
    });
  }

  const result = await userService.handleForgotPassword(email);

  return res.status(200).json({
    errCode: result.errCode,
    message: result.errMessage,
  });
};

const handleVerifyCode = async (req, res) => {
  let email = req.body.email;
  let code = req.body.code;
  if (!email || !code) {
    return res.status(400).json({
      errCode: 1,
      message: "Email and code are required",
    });
  }

  const result = await userService.verifyResetCode(email, code);

  return res.status(200).json({
    errCode: result.errCode,
    message: result.errMessage,
  });
};

const handleResetPassword = async (req, res) => {
  let email = req.body.email;
  let code = req.body.code;
  let newPassword = req.body.newPassword;
  if (!email || !code || !newPassword) {
    return res.status(400).json({
      errCode: 1,
      message: "Email, code, and newPassword are required",
    });
  }

  const result = await userService.resetPassword(email, code, newPassword);

  return res.status(200).json({
    errCode: result.errCode,
    message: result.errMessage,
  });
};

module.exports = {
  handleLogin: handleLogin,
  getAllUsers: getAllUsers,
  hanbleUserRegister,
  updateUser: updateUser,
  updateUserPassword: updateUserPassword,
  getUserById: getUserById,
  handleForgotPassword: handleForgotPassword,
  handleVerifyCode: handleVerifyCode,
  handleResetPassword: handleResetPassword,
};
