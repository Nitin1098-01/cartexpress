const dbDetails = require("./dbDetails/db.json");

const PostgresClient = require("pg").Client;
const db = new PostgresClient({
  host: dbDetails.host,
  port: dbDetails.port,
  database: dbDetails.database,
  user: dbDetails.user,
  password: dbDetails.password
});
db.connect();
module.exports = db;
