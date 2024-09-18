const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

app.use(express.static(__dirname));

app.get("/api/materials", async (req, res) => {
  try {
    const database = client.db("material");
    const material = database.collection("testing");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25 || 50 || 75;
    const skip = (page - 1) * limit;

    const result = await material.find({}).skip(skip).limit(limit).toArray();

    const total = await material.countDocuments();
    const totalPages = Math.ceil(total / limit);
    res.json({
      data: result,
      page,
      totalPages,
      totalItems: total,
    });
  } catch (e) {
    console.error("Database got some problems:", e);
    res.status(500).send("Error fetching data");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
  } catch (e) {
    console.error("Could not connect to MongoDB", e);
    process.exit(1); // exit code 1, usually means some shit happened
  }
}

connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});

process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed since you pressed the button!!");
  process.exit(0); //exit sucessfully, u definitely pressed ctrl c
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "progress.html"));
});
