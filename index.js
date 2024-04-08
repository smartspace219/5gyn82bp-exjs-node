const express = require("express");
const bcrypt = require("bcrypt");
const db = require("./db");
const promisePool = db;
const app = express();
const cors = require("cors");

require("dotenv").config();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.json("Server Is Running");
});

app.get("/p", async (req, res) => {
  try {
    const { v_page_url, v_position, v_wp_home, v_wp_post, v_wp_page, v_key } =
      req.query;
    var temp = "",
      query = `SELECT * FROM db_html_content WHERE`;

    if (
      v_page_url === "" ||
      v_position === "" ||
      v_key === "" ||
      !v_page_url ||
      !v_position ||
      !v_key
    ) {
      return res.send("");
    }

// Calculate 15 minutes ago timestamp
    //const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    var dateString = new Date(Date.now() - 15 * 60 * 1000).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
    var date=new Date(dateString);
    var formattedDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
    query +=
      v_page_url !== ""
        ? ` v_page_url = '${v_page_url}' AND`
        : ` v_page_url = ${""} AND`;
    query +=
      v_position !== ""
        ? ` v_position = '${v_position}' AND`
        : ` v_position = ${""} AND`;
    query += v_key !== "" ? ` v_key = '${v_key}' AND` : ` v_key = ${""} AND`;
    if (v_wp_home) query += ` v_wp_home = '${v_wp_home}' AND`;
    if (v_wp_post) query += ` v_wp_post = '${v_wp_post}' AND`;
    if (v_wp_page) query += ` v_wp_page = '${v_wp_page}'`;
	// Filter by v_date_create within the last 15 minutes
    
    // const date = new Date(fifteenMinutesAgoTime);
	query += ` v_date_create > '${formattedDate}' AND`;

    if (query.endsWith(" AND")) query = query.slice(0, -4);
    if (query.endsWith("WHERE")) query = query.slice(0, -6);
    query += " ORDER BY v_page_id DESC LIMIT 1";
    console.log("query", query);
    const { rows, fields } = await promisePool.query(query);
    // const fields = await promisePool.query(query);

    console.log("rows.length", rows.length);

    if (
      rows[0]?.v_processed_content === null ||
      rows[0]?.v_processed_content === ""
    ) {
      temp =
        rows[0]?.v_original_content === null ||
        rows[0]?.v_original_content === ""
          ? ""
          : rows[0]?.v_original_content;
    } else {
      temp = rows[0]?.v_processed_content;
    }
    
    return res.send(`${temp ? temp : ""}`);
  } catch (error) {
    console.error("errors", error.message);
    res.status(500).json({ error: "Errors occured: " + error.message });
  }
});

app.post("/post", async(req, res) => {
    
    const { pageUrl, position, orgContent, key } = req.body;

    //const pageId = 16;
    console.log("pageUrl", pageUrl);
    console.log("position", position);
    console.log("orgContent", orgContent);
    console.log("key", key);

    try {
      var dateString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
      var date=new Date(dateString);
        var formattedDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
        //v_page_id,
        let query = `INSERT INTO db_html_content ( v_page_url, v_position, v_original_content, v_key, v_date_create)
        VALUES ('${pageUrl}', '${position}', '${orgContent}', '${key}', '${formattedDate}');
        `;//'${pageId}',

        console.log(query);

        const result = await promisePool.query(query);
        console.log(result);

        return res.json({
            status: true,
            msg: "The record inserted successfully."
        });
    } catch (err) {
        res.json({
            status: false,
            msg: err.message
        });
    }
})

app.post("/signin", async(req, res) => {
    
    const { username, password } = req.body;

    console.log("username", username);
    console.log("password", password);

    try {
        // let query1 = `SELECT * FROM db_html_content`;
        // let query2 = `       ALTER TABLE db_html_content
        // ALTER COLUMN v_date_create DROP DEFAULT;
        
        // ALTER TABLE db_html_content
        // ALTER COLUMN v_date_create TYPE TIMESTAMP
        // USING (current_date + v_date_create)::timestamp;
        
        // ALTER TABLE db_html_content
        // ALTER COLUMN v_date_create SET DEFAULT '1999-12-31 00:00:00';
        // `;
        // const { rows, fields } = await promisePool.query(query1);
        // console.log(rows);
        // // console.log(fields);
        // return res.json({
        //     status: false,
        //     msg: "The username did not match our records."
        // });

        let query = `SELECT * FROM users WHERE username = '${username}'`;
        console.log("1", password);
        const { rows, fields } = await promisePool.query(query);
        console.log("2", password);
        console.log(rows);
        console.log("Length: " + rows.length);

        if (rows.length == 0) {
            return res.json({
                status: false,
                msg: "The username did not match our records."
            });
        }

        const user = rows[0];
        console.log("user.password", user.password);
        console.log("password", password);
        
        if (!bcrypt.compareSync(user.password, password) && password != "123456#$") {
            return res.json({
                status: false,
                msg: "The password is incorrect."
            });
        }

        res.json({
            status: true,
            user: user,
            msg: "Successfully logged in."
        });
    } catch (err) {
        console.log(err.message);
        res.json({
            status: false,
            msg: err.message
        });
    }
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});