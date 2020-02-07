const db = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const startPayment = async (req, res) => {
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
};

const donePayment = (req, res) => {
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
};

module.exports = { startPayment, donePayment };
