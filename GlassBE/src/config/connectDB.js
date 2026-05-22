require("dotenv").config();
import { Sequelize } from "sequelize";

const dbName = process.env.DB_NAME || "glasses";
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || null;
const dbHost = process.env.DB_HOST || "127.0.0.1";
const dbPort = parseInt(process.env.DB_PORT || "3306", 10);

const connectDB = async () => {
  try {
    const adminDb = new Sequelize("", dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: "mysql",
      logging: false,
    });

    await adminDb.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;`,
    );
    await adminDb.close();

    const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: "mysql",
      logging: false,
      timezone: "+07:00",
    });

    await sequelize.authenticate();
    console.log(
      `>>> Connection to "${dbName}" has been established successfully (${process.env.NODE_ENV || "development"}).`,
    );
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};

export default connectDB;
