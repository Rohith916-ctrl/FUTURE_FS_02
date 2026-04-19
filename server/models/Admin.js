const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("email", value.trim().toLowerCase());
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  },
  {
    tableName: "admins",
    timestamps: true
  }
);

module.exports = Admin;