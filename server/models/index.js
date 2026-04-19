const { sequelize } = require("../config/db");
const Admin = require("./Admin");
const Lead = require("./Lead");
const LeadNote = require("./LeadNote");

Lead.hasMany(LeadNote, {
  as: "notes",
  foreignKey: "leadId",
  onDelete: "CASCADE",
  hooks: true
});
LeadNote.belongsTo(Lead, {
  foreignKey: "leadId",
  as: "lead"
});

const syncModels = async () => {
  await sequelize.sync();
};

module.exports = {
  sequelize,
  Admin,
  Lead,
  LeadNote,
  syncModels
};