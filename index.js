const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.d0qpidn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

console.log(process.env.DB_USER);
async function run() {
  try {
    const testCollection = client.db("FareBd").collection("advertised");
    app.get("/", async (req, res) => {
      console.log("FareBD server is running");
      res.send('Server runing');
    });

    app.get("/test", async (req, res) => {
      const testData = await testCollection.find().toArray();
      res.send(testData);
    });

    // ================***** Rezaul code goes here *****================

    // ================xxxxx Rezaul code end here xxxxx================

    // ================***** Jubair code goes here *****================

    // ================xxxxx Jubair code ends here xxxxx================

    // ================***** Mostafizur code goes here *****================

    app.get('/property', async (req, res) => {
      const property = await client.db("FareBD").collection('property').find().toArray();
      // console.log(property);
      res.send(property);
    });

    app.get('/forSell', async (req, res) => {
      const toSell = await client.db("FareBD").collection('property').find({ property_condition: "toSell" }).toArray();
      // console.log(toSell);
      res.send(toSell);
    });

    app.get('/forRent', async (req, res) => {
      const toRent = await client.db("FareBD").collection('property').find({ property_condition: "toRent" }).toArray();
      // console.log(forRent);
      res.send(toRent);
    });

    // ================xxxxx Mostafizur code ends here xxxxx================

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
