const pg = require("pg");
require("dotenv").config();
const { Client } = pg;

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});
// var dateString = new Date(Date.now() - 15 * 60 * 1000).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
// var date=new Date(dateString);
// var formattedDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
// var dateString1 = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
// var date1=new Date(dateString1);
// console.log("time:", formattedDate);
// console.log("time:", dateString1);
client.connect((err) => {
  if (err) {
    console.log("Connection Error", err.message);
  } else {
    console.log("Connected From DB");
  }
});

module.exports = client;
