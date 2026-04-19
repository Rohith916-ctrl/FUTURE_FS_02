const bcrypt = require("bcryptjs");
const { Admin } = require("../models");

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }

  const existingAdmin = await Admin.findOne({ where: { email: email.toLowerCase().trim() } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 12);
    await Admin.create({ email: email.toLowerCase().trim(), password: hashedPassword });
  }
};

module.exports = seedAdmin;