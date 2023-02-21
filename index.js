const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.d0qpidn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

console.log(process.env.DB_USER);
async function run() {
  try {
    const testCollection = client.db("TestFareBd").collection("advertised");
    app.get("/", async (req, res) => {
      console.log("FareBD server is running");
    });

    app.get("/test", async (req, res) => {
      const testData = await testCollection.find().toArray();
      res.send(testData);
    });

    // ================***** Rezaul code goes here *****================

    // ================xxxxx Rezaul code end here xxxxx================

    // ================***** Jubair code goes here *****================

    // ================xxxxx Jubair code ends here xxxxx================

    // ================***** Mustafizur code goes here *****================

    // ================xxxxx Mustafizur code ends here xxxxx================

    // ================***** Jahid code goes here *****================

    // ================xxxxx Jahid code ends here xxxxx================

    // ================***** Amit Paul code goes here *****================

    // ================xxxxx Amit Paul code ends here xxxxx================

    // ================***** Anik Datta code goes here *****================

    // ================xxxxx Anik Datta code ends here xxxxx================
  } finally {
  }
}
run().catch((error) => console.error(error));

app.listen(port, () => {
  console.log(`FareBD server is running on ${port}`);
});
