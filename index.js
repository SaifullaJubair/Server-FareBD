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
      //---------All collection here---------

      const propertyCollection = client.db("FareBD").collection("property");
      const usersCollection = client.db('FareBD').collection('users');

      //---------All collection End here---------
      app.get("/", async (req, res) => {
         console.log("FareBD server is running");
         res.send('Server runing');
      });


      // ================***** Rezaul code goes here *****================
      app.post("/property", async (req, res) => {
         const doc = req.body;
         const result = await client
            .db("FareBD")
            .collection("property")
            .insertOne(doc);
         res.send(result);
      });
      // ================xxxxx Rezaul code ends here xxxxx================


      // ================***** Jubair code goes here *****================
      app.get('/searchByDivision/:name', async (req, res) => {
         const name = req.params.name;
         const result = await propertyCollection.find({ division: name }).toArray();
         console.log(result, name);
         res.send(result);
      })
      app.post('/adduser', async (req, res) => {
         const user = req.body;
         console.log(user);
         const findemail = await usersCollection.findOne({ email: user.email })
         if (findemail.email) {

         }
         else {
            const result = await usersCollection.insertOne(user);
            res.send(result);
         }
      });

      // ================xxxxx Jubair code ends here xxxxx================

      // ================***** Mustafizur code goes here *****================

      app.get('/property', async (req, res) => {
         const property = await propertyCollection.find().toArray();
         console.log(property);
         res.send(property);

      });

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
