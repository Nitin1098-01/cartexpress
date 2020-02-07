const db = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const addProduct = async (req, res) => {
  console.log(req.headers);
  if (!req.headers.authorization) {
    res.status(400).json({
      success: false,
      message: "Authorization failed... Try Again"
    });
    return;
  }
  let usr = null;
  try {
    usr = jwt.verify(req.headers.authorization, "1234567890!@#^&*()_qwiasjm");
    const { productname, image, description, quantity, price } = req.body;
    console.log(usr);
    if (usr.isadmin) {
      let result = await db.query(
        `INSERT INTO products (productname,image,description,quantity,price) VALUES('${productname}','${image}','${description}', '${quantity}' , '${price}');`
      );
      res.json({
        success: true,
        ...result.rows
      });
      return;
    } else {
      res.json({
        success: false,
        message: "You are not admin"
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error
    });
  }
};

const viewProduct = async (req, res) => {
  console.log(req.headers);

  let result = await db.query(`SELECT * FROM products;`);
  res.json({
    success: true,
    data: result.rows
  });
  return;
};

const addNewProduct = async (req, res) => {
  console.log(req.headers);
  console.log(req.body);

  const { name, desc, quantity, price, image } = req.body;
  // if (!req.headers.authorization) {
  //   res.status(400).json({
  //     success: false,
  //     message: "Authorization failed... Try Again"
  //   });
  //   return;
  // }

  let result = await db.query(
    `INSERT INTO products (productname,description,quantity,price,image) VALUES('${name}','${desc}',${quantity},${price},'${image}');`
  );
  res.json({
    success: true,
    message: "New Product inserted Successfully"
  });
  return;
};

module.exports = { addProduct, viewProduct, addNewProduct };
