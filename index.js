const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cors = require("cors");
const dbDetails = require("./dbDetails/db.json");
const routes = require("./routes/appRoutes");

const stripe = require("stripe")("sk_test_3xkPRB4bEYbSCXNFecHfjdeY00JA3cTTR1");

const PostgresClient = require("pg").Client;
const db = new PostgresClient({
  host: dbDetails.host,
  port: 5432,
  database: "roshan",
  user: "postgres",
  password: "root"
});
db.connect();
app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
routes(app);

app.listen(4000);
module.exports = app;
