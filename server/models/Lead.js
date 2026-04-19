const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Lead = sequelize.define(
  "Lead",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      set(value) {
        this.setDataValue("email", value.trim().toLowerCase());
      }
    },
    company: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    phone: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: ""
    },
    source: {
      type: DataTypes.ENUM("Website", "LinkedIn", "Referral", "Other"),
      allowNull: false,
      defaultValue: "Website"
    },
    status: {
      type: DataTypes.ENUM("new", "contacted", "converted"),
      allowNull: false,
      defaultValue: "new"
    },
    nextFollowUpAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    }
  },
  {
    tableName: "leads",
    timestamps: true,
    indexes: [
      { fields: ["email"] },
      { fields: ["name"] },
      { fields: ["status"] },
      { fields: ["createdAt"] }
    ]
  }
);

module.exports = Lead;