const db = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const sellerType = async (req, res) => {
  let userdetail = {};
  try {
    userdetail = await db.query(
      "SELECT * FROM users WHERE roleid=1 OR roleid=2;"
    );
  } catch (e) {
    console.log(e);
  }
  let cleanResult = userdetail.rows.map(row => {
    delete row.password;
    return row;
  });
  res.json(cleanResult);
};

module.exports = { sellerType };
