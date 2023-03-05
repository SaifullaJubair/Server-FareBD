const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(
  "sk_test_51M5tTOKnej6sIH3rkTrN8XVncfDecfYDbOTvUUcCTSxUk7GUzk0g1Qcosd9J8h4UvzSSzzRwdiFbkDim70itZ0KN00ADWkyMm8"
);
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

async function run() {
  try {
    //---------All collection here---------

    const propertyCollection = client.db("FareBD").collection("property");
    const usersCollection = client.db("FareBD").collection("users");
    const blogCollection = client.db("FareBD").collection("blog");
    const paymentsCollection = client.db("FareBD").collection("payments");
    const wishListCollection = client.db("FareBD").collection("wishlist");
    const advertiseCollection = client.db("FareBD").collection("advertise");

    //---------All collection End here---------
    app.get("/", async (req, res) => {
      console.log("FareBD server is running");
      res.send("Server runing");
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

    app.get("/users/checkBuyer", async (req, res) => {
      const query = { email: req.query.email };
      const user = await usersCollection.findOne(query);
      res.send({ isBuyer: user?.role === "user" });
    });

    app.get("/users/checkSeller", async (req, res) => {
      const query = { email: req.query.email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role === "seller" });
    });

    app.get("/users/checkAdmin", async (req, res) => {
      const query = { email: req.query.email };
      const user = await usersCollection.findOne(query);
      console.log(user, "ok");
      res.send({ isAdmin: user?.role === "admin" });
    });

    // stripe payment-intent
    app.post("/create-payment-intent", async (req, res) => {
      const property = req.body;
      const price = property.price;
      if (!price) return;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment);

      const id = payment.propertyId;
      const filter = { _id: new ObjectId(id) };

      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };

      await propertyCollection.updateOne(filter, updatedDoc);

      res.send(result);
    });

    // ================xxxxx Rezaul code ends here xxxxx================

    // ================***** Mostafizur code goes here *****================

    // for all property api
    app.get("/property", async (req, res) => {
      const property = await client
        .db("FareBD")
        .collection("property")
        .find()
        .toArray();
      // console.log(property);
      res.send(property);
    });

    // for sell only
    app.get("/forSell", async (req, res) => {
      const toSell = await client
        .db("FareBD")
        .collection("property")
        .find({ property_condition: "toSell" })
        .toArray();
      // console.log(toSell);
      res.send(toSell);
    });

    // for rent only
    app.get("/forRent", async (req, res) => {
      const toRent = await client
        .db("FareBD")
        .collection("property")
        .find({ property_condition: "toRent" })
        .toArray();
      // console.log(forRent);
      res.send(toRent);
    });

    // details of single division data api
    app.get("/singleproperty/:id", async (req, res, next) => {
      const id = req.params.id;
      const result = await propertyCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // ================xxxxx Mostafizur code ends here xxxxx================

    // ================***** Jubair code goes here *****================
    app.get("/searchByDivision/:name", async (req, res) => {
      const name = req.params.name;
      // console.log(name);
      const result = await propertyCollection
        .find({ division: name })
        .toArray();
      console.log(result, name);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(users);
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });
    app.get("/singleuser/:e", async (req, res) => {
      const e = req.params.e;
      const query = { email: e };
      const result = await usersCollection.findOne(query);

      res.send(result);
    });

    app.post("/adduser", async (req, res) => {
      const user = req.body;
      // console.log(user);
      // Rezaul wrote this code for preventing adding user again in the database
      const query = { email: req.body.email };
      const alreadyLoggedIn = await usersCollection.findOne(query);

      if (alreadyLoggedIn)
        return res.send({ message: "User already logged in!" });

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.put("/users/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        option
      );
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });
    // ================xxxxx Jubair code ends here xxxxx================

    // ================***** Zahid's code start here *****================
    // recent 2 posts
    app.get("/recent-post", async (req, res) => {
      const recentPost = await client
        .db("FareBD")
        .collection("property")
        .find()
        .sort({ post_date: -1 })
        .limit(2)
        .toArray();
      res.send(recentPost);
    });

    // recently added 5 properties
    app.get("/recent-properties", async (req, res) => {
      const recentProperties = await client
        .db("FareBD")
        .collection("property")
        .find()
        .sort({ post_date: -1 })
        .limit(5)
        .toArray();
      res.send(recentProperties);
    });

    app.get("/my-posts", async (req, res) => {
      // const userEmail = req.query.email;
      // const query = {user_email: userEmail}
      const myPosts = await client
        .db("FareBD")
        .collection("property")
        .find()
        .toArray();
      res.send(myPosts);
    });

    // All Properties
    app.get("/all-properties", async (req, res) => {
      const allProperties = await client
        .db("FareBD")
        .collection("property")
        .find()
        .toArray();
      res.send(allProperties);
    });

    // Seller Properties
    app.get("/my-posts/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { user_email: userEmail };
      const myPosts = await client
        .db("FareBD")
        .collection("property")
        .find(query)
        .toArray();
      res.send(myPosts);
    });

    // Admin All Wishlist
    app.get("/wishlist", async (req, res) => {
      const wishlist = await wishListCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.send(wishlist);
    });
    // Buyer My Wishlist
    app.get("/wishlist/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const cursor = wishListCollection.find(query);
      const wishlist = await cursor.sort({ createdAt: -1 }).toArray();
      res.send(wishlist);
    });

    // Advertise Post
    app.post("/advertise", async (req, res) => {
      const post = req.body;
      const advertises = await advertiseCollection.find().toArray();
      const itemFound = advertises.find((item) => item._id === post._id);
      if (itemFound) {
        res.send({ message: "Item already advertised!" });
      } else {
        const result = await advertiseCollection.insertOne(post);
        res.send(result);
      }
    });

    // Delete single property
    app.delete("/singleproperty/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await propertyCollection.deleteOne(filter);
      res.send(result);
    });
    // ================xxxxx Zahid's code ends here xxxxx================

    // ================***** Amit Paul code goes here *****================
    app.post("/postBlog", async (req, res) => {
      try {
        const blog = req.body;
        console.log(blog);
        const result = await blogCollection.insertOne(blog);
        console.log(result);
        res.send({
          success: true,
          data: result,
          message: "Successfully get data",
        });
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    app.get("/getBlog", async (req, res) => {
      try {
        const query = {};

        const result = await blogCollection.find(query).toArray();

        res.send({
          success: true,
          data: result,
          message: "Successfully get data",
        });
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    app.get("/getBlog/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const resust = await blogCollection.findOne(query);
        console.log(resust);
        res.send(resust);
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // delete user id
    app.delete("/getBlog/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const query = await blogCollection.deleteOne(filter);
        res.send({
          success: true,
          data: query,
          message: "Successfully get data",
        });
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });
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
