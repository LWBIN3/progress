const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
const app = express();
const port = 3000;
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
// 提供靜態文件，這樣我可以直接在網站查看我的html、css、js
app.use(express.static(__dirname));
// API 路由
app.get("/api/material", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("material");
    const materials = database.collection("testing");
    const result = await materials.find({}).toArray();
    res.json(result);
  } catch (e) {
    console.error("Database error:", e);
    res.status(500).send("Error fetching data");
  } finally {
    await client.close();
  }
});
// 處理根路由
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "progress.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
