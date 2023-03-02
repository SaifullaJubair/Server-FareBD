const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    //---------All collection here---------

    const propertyCollection = client.db("FareBD").collection("property");
    const usersCollection = client.db('FareBD').collection('users');
    const blogCollection = client.db('FareBD').collection('blog');

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


    // ================***** Mostafizur code goes here *****================

    // for all property api
    app.get('/property', async (req, res) => {
      const property = await client.db("FareBD").collection('property').find().toArray();
      // console.log(property);
      res.send(property);
    });

    // for sell only
    app.get('/forSell', async (req, res) => {
      const toSell = await client.db("FareBD").collection('property').find({ property_condition: "toSell" }).toArray();
      // console.log(toSell);
      res.send(toSell);
    });

    // for rent only
    app.get('/forRent', async (req, res) => {
      const toRent = await client.db("FareBD").collection('property').find({ property_condition: "toRent" }).toArray();
      // console.log(forRent);
      res.send(toRent);
    });

    // details of single division data api
    app.get('/singleproperty/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(name);
      const result = await propertyCollection.findOne({ _id: new ObjectId(id) });
      console.log(result);
      res.send(result);
    })

    // ================xxxxx Mostafizur code ends here xxxxx================

    // ================***** Jubair code goes here *****================
    app.get('/searchByDivision/:name', async (req, res) => {
      const name = req.params.name;
      // console.log(name);
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


    // ================***** Zahid's code start here *****================
    // recent 2 posts
    app.get('/recent-post', async (req, res) => {
      const recentPost = await client.db("FareBD").collection("property").find().sort({ post_date: -1 }).limit(2).toArray();
      res.send(recentPost);
    })

      // recently added 5 properties
    app.get('/recent-properties', async (req, res) => {
      const recentProperties = await client.db("FareBD").collection("property").find().sort({ post_date: -1 }).limit(5).toArray();
      res.send(recentProperties);
    })

    app.get('/my-posts', async (req, res) => {
      // const userEmail = req.query.email;
      // const query = {user_email: userEmail}
      const myPosts = await client.db("FareBD").collection("property").find().toArray();
      res.send(myPosts);
    })
    // ================xxxxx Zahid's code ends here xxxxx================

    // ================***** Amit Paul code goes here *****================
    app.post('/postBlog', async (req, res) => {
      try {

        const blog = req.body;
        console.log(blog);
        const result = await blogCollection.insertOne(blog);
        console.log(result);
        res.send({
          success: true,
          data: result,
          message: 'Successfully get data'
        })
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    app.get('/getBlog', async (req, res) => {
      try {
        const query = {}

        const result = await blogCollection.find(query).toArray()

        res.send({
          success: true,
          data: result,
          message: 'Successfully get data'
        })
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    app.get('/getBlog/:id', async (req, res) => {
      try {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }

        const resust = await blogCollection.findOne(query)
        console.log(resust);
        res.send(resust)

      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    // delete user id
    app.delete('/getBlog/:id',  async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const query = await blogCollection.deleteOne(filter);
        res.send({
          success: true,
          data: query,
          message: 'Successfully get data'
        })

      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })
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
