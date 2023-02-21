const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();


const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.d0qpidn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

console.log(process.env.DB_USER)
async function run() {

   try {
      app.get('/', (req, res) => {
         res.send('FareBD server is running ')

      })
   }
   finally { }
}
run().catch(error => console.error(error));

app.listen(port, () => {
   console.log(`FareBD server is running on ${port}`);
})