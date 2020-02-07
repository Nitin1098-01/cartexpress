const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dbDetails = require("../dbDetails/db.json");

const userroute = require("../controller/user");
const sellerroute = require("../controller/seller");
const productroute = require("../controller/product");
const cartroute = require("../controller/cart");
const favoriteroute = require("../controller/favorite");
const paymentroute = require("../controller/payment");

module.exports = app => {
  app.get("/", (req, res) => {
    res.json({ sucess: true, message: "Connection Established" });
  });

  app.get("/users", userroute.user);
  app.post("/signup", userroute.userSignup);
  app.post("/login", userroute.userSignin);

  app.get("/seller", sellerroute.sellerType);
  app.post("/addNewProduct", productroute.addNewProduct);

  app.get("/customer", userroute.customer);

  app.post("/addproducts", productroute.addProduct);
  app.get("/viewproduct", productroute.viewProduct);

  app.post("/delete", userroute.deleteUser);

  app.post("/addcart", cartroute.addCart);
  app.get("/viewcart", cartroute.viewCart);
  app.post("/deletecart", cartroute.deleteCart);

  app.post("/addfavorite", favoriteroute.addFavorite);
  app.get("/viewfavorite", favoriteroute.viewFavorite);
  app.post("/deletefav", favoriteroute.deleteFavorite);

  app.post("/startpayment", paymentroute.startPayment);
  app.post("/donepayment", paymentroute.donePayment);

  app.post("/dummypost", userroute.dummy);
};
