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
    const feedbackCollection = client.db("FareBD").collection("feedback");
    const commentCollection = client.db("FareBD").collection("comment");
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

    // get a wishlist
    app.get("/wishlist/:id", async (req, res) => {
      const { id } = req.params;
      const { email } = req.query;
      const query = { propertyId: id, userEmail: email };
      const result = await wishListCollection.findOne(query);
      if (result === null) return res.send({ message: "There is no data" });
      return res.send(result);
    });

    // delete a wishlist
    app.delete("/wishlist/:id", async (req, res) => {
      const { id } = req.params;
      const { email } = req.query;
      const query = { propertyId: id, userEmail: email };
      const result = await wishListCollection.deleteOne(query);
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
        .find({ property_condition: "toSale" })
        .toArray();
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

    //division get by name

    app.get("/searchByDivision/:name", async (req, res) => {
      const name = req.params.name;
      // console.log(name);
      const result = await propertyCollection
        .find({ division: name })
        .toArray();
      res.send(result);
    });

    //----users api start here------//

    //all user get
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(users);
    });

    //user get by id
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });

    //singleuser get by email
    app.get("/singleuser/:e", async (req, res) => {
      const e = req.params.e;
      const query = { email: e };
      const result = await usersCollection.findOne(query);

      res.send(result);
    });

    // add user post
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

    //users role update
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

    //user delete
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

    //----users api end here------//

    //----comments api start here------//
    
    // all comment get
    app.get("/allcomments/", async (req, res) => {
      const result = await commentCollection.find().sort({ createdAt: -1 }).toArray();
      res.send(result);
    });

    //comment get by id
    app.get("/comment/:id", async (req, res) => {
      const id = req.params.id;

      const query = { propertyId: id };
      const cursor = commentCollection.find(query).limit(10);
      const result = await cursor.sort({ createdAt: -1 }).toArray();
      res.send(result);
    });
    app.get("/comments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { email: id };
      const cursor = commentCollection.find(query);
      const result = await cursor.sort({ createdAt: -1 }).toArray();
      res.send(result);
    });
    // add comment post
    app.post("/addcomment", async (req, res) => {
      const comment = req.body;
      // console.log(comment);
      const result = await commentCollection.insertOne(comment);
      res.send(result);
    });

    //comment update by it
    app.put("/commentupdate/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const user = req.body;
      const option = { upsert: true };
      console.log(user);
      console.log(id);
      const updatedUser = {
        $set: {
          comment: user?.commentUpdate,
        },
      };
      const result = await commentCollection.updateOne(
        filter,
        updatedUser,
        option
      );
      console.log(result);
      res.send(result);
      // console.log(updatedUser)
    });

    // comment delete by id
    app.delete("/comment/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await commentCollection.deleteOne(filter);
      res.send(result);
    });

    //----comments api end here------//

    //---search field----//

    app.post("/search", async (req, res) => {
      const { areaType, category, division, maxSize, minSize, purpose } =
        req.body;
      if (
        !areaType &&
        !category &&
        !division &&
        !maxSize &&
        !minSize &&
        !purpose
      ) {
        const allData = await propertyCollection.find({}).toArray();
        return res.send(allData);
      }
      let allQueries = [];
      if (areaType) {
        allQueries = [...allQueries, { area_type: { $eq: areaType } }];
      }
      if (category) {
        allQueries = [...allQueries, { property_type: { $eq: category } }];
      }
      if (division) {
        allQueries = [...allQueries, { division: { $eq: division } }];
      }
      if (purpose) {
        allQueries = [...allQueries, { property_condition: { $eq: purpose } }];
      }
      if (minSize) {
        allQueries = [...allQueries, { size: { $gt: minSize } }];
      }
      if (maxSize) {
        allQueries = [...allQueries, { size: { $lt: maxSize } }];
      }
      const allData = await propertyCollection
        .find({ $and: allQueries })
        .toArray();
      console.log(allQueries);
      res.send(allData);
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
    app.get("/mywishlist/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const cursor = wishListCollection.find(query);
      const wishlist = await cursor.sort({ createdAt: -1 }).toArray();
      if (wishlist === null) return res.send({ message: "There is no data" });
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
    app.post("/users/update/:id", async (req, res) => {
      const id = req.params.id;
      const userRole = req.headers.role;
      const filter = { _id: new ObjectId(id) };
      // const option = { upsert: true };
      const updatedDoc = {
        $set: {
          role: userRole,
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Delete single property
    app.delete("/singleproperty/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await propertyCollection.deleteOne(filter);
      res.send(result);
    });

    // Delete MyWishlist
    app.delete("/mywishlist/:id", async (req, res) => {
      const { id } = req.params;
      const { email } = req.query;
      const query = { propertyId: id, userEmail: email };
      const result = await wishListCollection.deleteOne(query);
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

    // feedback
    app.get("/feedback", async (req, res) => {
      try {
        const query = {};

        const result = await feedbackCollection.find(query).toArray();

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

    // advertise
    app.get("/advertise", async (req, res) => {
      const advertise = await advertiseCollection
        .find()
        .sort({ post_date: -1 })
        .limit(3)
        .toArray();
      res.send(advertise);
    });

    // ================xxxxx Amit Paul code ends here xxxxx================

    // ================***** Anik Datta code goes here *****================
    app.get("/get-wishlist", async (req, res) => {
      const wishlist = await wishListCollection.find().toArray();
      res.send(wishlist);
    });
    app.post("/add-wishlist", async (req, res) => {
      const wishItem = req.body;
      console.log(req.body);
      const query = {
        userId: req.body.userId,
        userEmail: req.body.userEmail,
        propertyId: req.body.propertyId,
      };
      // Reazaul wrote this piece of code for prevent adding wishlist to the database again
      const alreadyAddedWishlist = await wishListCollection.findOne(query);

      if (alreadyAddedWishlist)
        return res.send({
          message: "This property already wishlisted",
        });

      const result = await wishListCollection.insertOne(wishItem);

      res.send(result);
    });
    // ================xxxxx Anik Datta code ends here xxxxx================
  } finally {
  }
}
run().catch((error) => console.error(error));

app.listen(port, () => {
  console.log(`FareBD server is running on ${port}`);
});
