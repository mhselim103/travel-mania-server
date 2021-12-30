const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const objectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

//mongodb connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yd5hs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("travelMania");
    const packageCollection = database.collection("tourPackage");
    const emailCollection = database.collection("clientEmails");
    const ordersCollection = database.collection("orders");

    // Get all package api
    app.get("/packages", async (req, res) => {
      const cursor = packageCollection.find({});
      const packages = await cursor.toArray();
      // console.log(packages);
      res.json(packages);
    });

    // Get single service
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: objectId(id) };
      const package = await packageCollection.findOne(query);
      // console.log("hello from inside dynamic route");
      res.json(package);
    });

    // Get all ordersCollection
    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      // console.log(orders);
      res.json(orders);
    });

    // Get Specific Orders
    app.get("/myorders/:email", async (req, res) => {
      const cursor = ordersCollection.find({ email: req.params.email });
      const orders = await cursor.toArray();
      res.json(orders);
    });

    // POST method route
    // order booking
    app.post("/orders", async (req, res) => {
      const order = req.body;
      // console.log("hit the post api", order);
      const result = await ordersCollection.insertOne(order);
      // console.log(result);
      res.json(result);
    });
    // add new destinations
    app.post("/packages", async (req, res) => {
      const result = await packageCollection.insertOne(req.body);
      res.json(result);
    });

    //add subscription email
    app.post("/emails", async (req, res) => {
      const result = await emailCollection.insertOne(req.body);
      // console.log(result);
      res.json(result);
    });

    // delete operation
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: objectId(id) };
      const result = await ordersCollection.deleteOne(query);
      /* if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      } */
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("travelMania Running");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
