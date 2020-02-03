const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const stripe = require("stripe")("sk_test_3xkPRB4bEYbSCXNFecHfjdeY00JA3cTTR1");

const PostgresClient = require("pg").Client;
const db = new PostgresClient({
  host: "localhost",
  port: 5432,
  database: "roshan",
  user: "postgres",
  password: "root"
});
db.connect();
app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.get("/", (req, res) => {
  res.json({ sucess: true, message: "Connection Established" });
});

app.get("/users", async (req, res) => {
  let userdetail = {};
  try {
    userdetail = await db.query("SELECT * FROM users;");
  } catch (e) {
    console.log(e);
  }
  let cleanResult = userdetail.rows.map(row => {
    delete row.password;
    return row;
  });
  res.json(cleanResult);
});

app.get("/customer", async (req, res) => {
  let userdetail = {};
  try {
    userdetail = await db.query("SELECT * FROM users WHERE roleid=0;");
  } catch (e) {
    console.log(e);
  }
  let cleanResult = userdetail.rows.map(row => {
    delete row.password;
    return row;
  });
  res.json(cleanResult);
});

app.post("/delete", async (req, res) => {
  console.log("The request ", req.body);
  let result = await db.query(
    `DELETE FROM users WHERE userid= ${req.body.userid};`
  );
  res.json({
    success: true,
    message: "Deleted Successfully"
  });
  return;
});

app.post("/deletefav", async (req, res) => {
  console.log("The request ", req.body);
  let result = await db.query(
    `DELETE FROM favorite WHERE product_id= ${req.body.product_id};`
  );
  res.json({
    success: true,
    message: "Deleted Successfully"
  });
  return;
});

app.get("/seller", async (req, res) => {
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
});

app.post("/signup", async (req, res) => {
  //Return success message if successful, else show success false and message

  let { username, password, number, email, roleid } = req.body;
  let passHash = bcrypt.hashSync(password, 10);
  let result = {};
  try {
    result = await db.query(
      `INSERT into users (username,password,phone,email,roleid) values ('${username}','${passHash}','${number}','${email}','${roleid}')`
    );
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error });
    return;
  }
  res.json({
    success: true,
    message: "Inserted successfully"
  });
});

app.post("/login", async (req, res) => {
  let allUsers = await db.query(`SELECT * from users`).catch(err => {
    res.json({
      success: false,
      message: "Something went wrong"
    });
    return;
  });
  let matchedUsers = allUsers.rows.filter(entry => {
    return entry.username == req.body.username;
  });
  console.log(req.body);
  if (matchedUsers.length == 0) {
    res.json({
      sucess: false,
      message: "User does not exist"
    });
    return;
  } else {
    let matchedUser = matchedUsers[0];
    // console.log('Received from req ', req.body)
    if (bcrypt.compareSync(req.body.password, matchedUser.password)) {
      const token = jwt.sign(matchedUser, "1234567890!@#^&*()_qwiasjm");
      res.json({
        success: true,
        message: "Valid Customer",
        token,
        user: matchedUser
      });
      return;
    } else {
      res.json({
        success: false,
        message: "Password Mismatch"
      });
    }

    // res.status(404).json({
    //   success: false,
    //   message: "Password is invalid"
    // });
  }
});

app.post("/addproducts", async (req, res) => {
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
});

app.get("/viewproduct", async (req, res) => {
  console.log(req.headers);

  let result = await db.query(`SELECT * FROM products;`);
  res.json({
    success: true,
    data: result.rows
  });
  return;
});

app.post("/addcart", async (req, res) => {
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
    const { product_id } = req.body.data;
    console.log("The request ", req.body);
    console.log(usr);
    let selectProductsResult = await db.query(
      `SELECT * FROM cart WHERE product_id = ${product_id} AND user_id=${usr.userid};`
    );
    if (selectProductsResult.rowCount != 0) {
      //There are products already
      res.json({
        success: false,
        message: "Already exists"
      });
      return;
    }
    if (usr) {
      let result = await db.query(
        `INSERT INTO cart (product_id,user_id) VALUES (${product_id},${usr.userid});`
      );
      res.json({
        success: true,
        ...result
      });
      return;
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error
    });
  }
});

app.get("/viewcart", async (req, res) => {
  console.log(req.headers.authorization);
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
    const { product_id, user_id } = req.body;
    console.log(usr);

    if (usr) {
      let result = await db.query(
        `SELECT users.username, products.productname, products.image, products.description, products.quantity, products.price FROM users, products, cart WHERE users.userid = ${usr.userid} AND users.userid = cart.user_id AND products.productId = cart.product_id;`
      );
      console.log(result);
      res.json({
        success: true,
        data: result.rows
      });
      return;
    }
    let cartcount = await db.query(`SELECT COUNT(*) FROM cart;`);
    console.log(cartcount);
    res.json({
      success: true,
      data: cartcount
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error
    });
  }
});

app.post("/addfavorite", async (req, res) => {
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
    const { product_id } = req.body.data;
    console.log("The request ", req.body);
    console.log(usr);

    let selectProductsResult = await db.query(
      `SELECT * FROM favorite WHERE product_id = ${product_id} AND user_id=${usr.userid};`
    );
    if (selectProductsResult.rowCount != 0) {
      //There are products already
      res.json({
        success: false,
        message: "Already exists"
      });
      return;
    }
    if (usr) {
      let result = await db.query(
        `INSERT INTO favorite (product_id,user_id) VALUES (${product_id},${usr.userid});`
      );
      res.json({
        success: true,
        ...result
      });
      return;
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error
    });
  }
});

app.get("/viewfavorite", async (req, res) => {
  console.log(req.headers.authorization);
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
    const { product_id, user_id } = req.body;
    console.log(usr);

    if (usr) {
      let result = await db.query(
        `SELECT products.productid ,users.username, products.productname, products.image, products.description, products.quantity, products.price FROM users, products, favorite WHERE users.userid = ${usr.userid} AND users.userid = favorite.user_id AND products.productId = favorite.product_id;`
      );
      res.json({
        success: true,
        data: result.rows
      });
      return;
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error
    });
  }
});

app.post("/startpayment", async (req, res) => {
  console.log(req.body);
  let amount = req.body.price;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.ceil(req.body.price),
    currency: "inr"
  });
  console.log(req.headers.authorization);
  console.log(req.body);
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
    console.log(usr);
    if (usr) {
      let result = await db.query(`INSERT INTO transaction(user_id,totalprice,isPaymentDone) VALUES(${usr.userid},${amount},true) RETURNING purchaseid;
    `);
      console.log("RESULT FROM insert QUERY,", result);
      res.json({
        success: true,
        data: {
          result: result.rows[0].purchaseid,
          client_secret: paymentIntent.client_secret
        }
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error
    });
  }
});

app.post("/donepayment", (req, res) => {
  let transactionid = req.body.transactionid;
  let purchaseid = req.body.purchaseid;

  let result = db.query(
    `UPDATE transaction SET transactionid= '${transactionid}',ispaymentdone=true WHERE purchaseid= ${purchaseid};`
  );
  res.json({
    success: true,
    message: "Transaction is Successful"
  });
  return;
});

app.post("/dummypost", (req, res) => {
  res.json({
    body: req.body,
    headers: req.headers
  });
});

app.post("/addNewProduct", async (req, res) => {
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
});

app.listen(4000);
