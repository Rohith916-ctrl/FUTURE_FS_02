const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const LeadNote = sequelize.define(
  "LeadNote",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    leadId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "lead_notes",
    updatedAt: false,
    indexes: [{ fields: ["leadId"] }]
  }
);

module.exports = LeadNote;