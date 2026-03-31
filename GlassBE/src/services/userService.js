import { where } from "sequelize";
import db from "../models";
import bcrypt from "bcryptjs";
import user from "../models/user";
import emailService from "./emailService";

var jwt = require("jsonwebtoken");

let getUsers = () => {
  return new Promise(async (resolve, reject) => {
    let userId = req.query.id || "ALL";
    try {
      let users = "";
      if (userId === "ALL") {
        users = await db.User.findAll({
          attributes: { exclude: ["password_hash"] },
        });
      } else if (userId) {
        users = await db.User.findOne({
          where: { id: userId },
          attributes: { exclude: ["password_hash"] },
        });
      }
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

let getUserById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: id },
        attributes: { exclude: ["password_hash"] },
      });
      if (user) {
        resolve(user);
      } else {
        resolve(null);
      }
    } catch (e) {
      reject(e);
    }
  });
};

let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};
      let isExist = await checkUserEmail(email);
      if (isExist) {
        let user = await db.User.findOne({
          attributes: ["id", "fullname", "email", "role_id", "password_hash"],
          where: { email: email },
          raw: true,
        });

        if (user) {
          let check = await bcrypt.compareSync(password, user.password_hash);
          if (check) {
            const payload = {
              userId: user.id,
              email: user.email,
            };
            const token = jwt.sign(payload, "MY_SECRET_KEY", {
              expiresIn: "1d",
            });

            userData.errCode = 0;
            userData.errMessage = "OK";
            delete user.password_hash;
            userData.user = user;
            userData.token = token;
          } else {
            userData.errCode = 3;
            userData.errMessage = "Wrong password";
          }
        } else {
          userData.errCode = 2;
          userData.errMessage = "User not found";
        }
      } else {
        userData.errCode = 1;
        userData.errMessage = "Your email is not in the system";
      }

      resolve(userData);
    } catch (e) {
      reject(e);
    }
  });
};

let hanbleUserRegister = (email, password, fullname) => {
  return new Promise(async (resolve, reject) => {
    try {
      let isExist = await checkUserEmail(email);
      if (isExist) {
        resolve({
          errCode: 1,
          errMessage: "Your email is already in used, please try another email",
        });
      } else {
        let hashPasswordFromBcrypt = await bcrypt.hashSync(password, 10);
        let newUser = await db.User.create({
          email: email,
          password_hash: hashPasswordFromBcrypt,
          fullname: fullname,
          role_id: "2",
        });

        resolve({
          errCode: 0,
          errMessage: "OK",
          user: { id: newUser.id, email: email, fullname: fullname },
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let checkUserEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: email },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

let updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: id },
      });
      if (user) {
        user.fullname = data.fullname;
        user.email = data.email;
        await user.save();
        resolve(user);
      } else {
        resolve(null);
      }
    } catch (e) {
      reject(e);
    }
  });
};

let updateUserPassword = (id, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: id },
      });
      if (user) {
        let hashPasswordFromBcrypt = await bcrypt.hashSync(password, 10);
        user.password_hash = hashPasswordFromBcrypt;
        await user.save();
        resolve(user);
      } else {
        resolve(null);
      }
    } catch (e) {
      reject(e);
    }
  });
};

let checkUserPassword = (id, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { id: id },
        raw: true,
      });
      if (user) {
        let check = await bcrypt.compareSync(password, user.password_hash);
        resolve(check);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

let handleForgotPassword = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};
      let isExist = await checkUserEmail(email);
      if (!isExist) {
        userData.errCode = 1;
        userData.errMessage = "Email not found in the system";
        resolve(userData);
        return;
      }

      // Generate 6-digit numeric code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Set expiration to 30 minutes from now
      const expirationDate = new Date();
      expirationDate.setMinutes(expirationDate.getMinutes() + 30);

      // Update user with reset code and expiration
      let user = await db.User.findOne({
        where: { email: email },
      });

      if (user) {
        user.reset_code = resetCode;
        user.reset_code_expires = expirationDate;
        await user.save();

        // Send email with reset code
        try {
          await emailService.sendResetCodeEmail(email, resetCode);
          userData.errCode = 0;
          userData.errMessage = "Reset code sent to your email";
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          userData.errCode = 2;
          userData.errMessage = `Failed to send email: ${emailError.message || "Please try again later."}`;
        }
      } else {
        userData.errCode = 1;
        userData.errMessage = "User not found";
      }

      resolve(userData);
    } catch (e) {
      reject(e);
    }
  });
};

let verifyResetCode = (email, code) => {
  return new Promise(async (resolve, reject) => {
    try {
      let result = {};
      let user = await db.User.findOne({
        where: { email: email },
        raw: true,
      });

      if (!user) {
        result.errCode = 1;
        result.errMessage = "Email not found";
        resolve(result);
        return;
      }

      if (!user.reset_code || !user.reset_code_expires) {
        result.errCode = 2;
        result.errMessage = "No reset code found. Please request a new one.";
        resolve(result);
        return;
      }

      // Check if code matches
      if (user.reset_code !== code) {
        result.errCode = 3;
        result.errMessage = "Invalid reset code";
        resolve(result);
        return;
      }

      // Check if code has expired
      const now = new Date();
      const expirationDate = new Date(user.reset_code_expires);
      if (now > expirationDate) {
        result.errCode = 4;
        result.errMessage = "Reset code has expired. Please request a new one.";
        resolve(result);
        return;
      }

      result.errCode = 0;
      result.errMessage = "Code verified successfully";
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
};

let resetPassword = (email, code, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      let result = {};

      // First verify the code
      let verifyResult = await verifyResetCode(email, code);
      if (verifyResult.errCode !== 0) {
        resolve(verifyResult);
        return;
      }

      // Code is valid, now reset the password
      let user = await db.User.findOne({
        where: { email: email },
      });

      if (user) {
        // Hash the new password
        let hashPasswordFromBcrypt = await bcrypt.hashSync(newPassword, 10);
        user.password_hash = hashPasswordFromBcrypt;
        // Clear reset code fields
        user.reset_code = null;
        user.reset_code_expires = null;
        await user.save();

        result.errCode = 0;
        result.errMessage = "Password reset successfully";
      } else {
        result.errCode = 1;
        result.errMessage = "User not found";
      }

      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  handleUserLogin: handleUserLogin,
  getUsers: getUsers,
  hanbleUserRegister: hanbleUserRegister,
  updateUser: updateUser,
  updateUserPassword: updateUserPassword,
  checkUserPassword: checkUserPassword,
  getUserById: getUserById,
  handleForgotPassword: handleForgotPassword,
  verifyResetCode: verifyResetCode,
  resetPassword: resetPassword,
};
