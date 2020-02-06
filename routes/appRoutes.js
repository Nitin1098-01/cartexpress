const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dbDetails = require("../dbDetails/db.json");
const userroute = require("../controller/user");
const sellerroute = require("../controller/seller");
const productroute = require("../controller/product");
const cartroute = require("../controller/cart");
const favoriteroute = require("../controller/favorite");
const paymentroute = require("../controller/payment");

const PostgresClient = require("pg").Client;
const db = new PostgresClient({
  host: dbDetails.host,
  port: 5432,
  database: "roshan",
  user: "postgres",
  password: "root"
});
db.connect();
module.exports = app => {
  app.get("/", (req, res) => {
    res.json({ sucess: true, message: "Connection Established" });
  });

  app.get("/users", userroute.userSign);
  app.post("/signup", userroute.userLogin);
  app.post("/login", userroute.loginSecure);

  app.get("/seller", sellerroute.sellerType);

  app.get("/customer", userroute.customer);

  app.post("/addproducts", productroute.addProduct);
  app.get("/viewproduct", productroute.viewProduct);

  app.post("/deletecart", cartroute.deleteCart);

  app.post("/delete", userroute.deleteUser);

  app.post("/deletefav", favoriteroute.deleteFavorite);

  app.post("/addcart", cartroute.addCart);
  app.get("/viewcart", cartroute.viewCart);

  app.post("/addfavorite", favoriteroute.addFavorite);
  app.get("/viewfavorite", favoriteroute.viewFavorite);

  app.post("/startpayment", paymentroute.startPayment);
  app.post("/donepayment", paymentroute.donePayment);

  app.post("/dummypost", userroute.dummy);

  app.post("/addNewProduct", productroute.addNewProduct);
};
