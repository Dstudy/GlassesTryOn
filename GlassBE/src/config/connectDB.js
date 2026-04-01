const { Sequelize } = require("sequelize");
require("dotenv").config(); // Đảm bảo đã nạp biến môi trường

// Lấy môi trường hiện tại (mặc định là development)
const env = process.env.NODE_ENV || "development";
// Import file config
const config = require(__dirname + "/../config/config.json")[env];

let sequelize;

// Khởi tạo instance Sequelize từ config
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

let connectDB = async () => {
  try {
    // Tự động tạo Database nếu chưa có (Dùng tài khoản root để check)
    const adminDb = new Sequelize("", config.username, config.password, {
      host: config.host,
      dialect: config.dialect,
      logging: false,
    });

    await adminDb.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;`,
    );
    await adminDb.close();

    // Kết nối chính thức
    await sequelize.authenticate();
    console.log(
      `>>> Connection to "${config.database}" has been established successfully (${env}).`,
    );
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};

export default connectDB;
