const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cors = require("cors");
const routes = require("./routes/appRoutes");

const stripe = require("stripe")("sk_test_3xkPRB4bEYbSCXNFecHfjdeY00JA3cTTR1");

app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
routes(app);

app.listen(4000);
