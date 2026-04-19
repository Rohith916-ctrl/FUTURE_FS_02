const { Sequelize } = require("sequelize");

const requiredVariables = ["MYSQL_HOST", "MYSQL_PORT", "MYSQL_DATABASE", "MYSQL_USER", "MYSQL_PASSWORD"];

requiredVariables.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is not defined`);
  }
});

const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  dialect: "mysql",
  logging: false,
  define: {
    underscored: false
  }
});

const connectDB = async () => {
  await sequelize.authenticate();
};

module.exports = {
  sequelize,
  connectDB
};