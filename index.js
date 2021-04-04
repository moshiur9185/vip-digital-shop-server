const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vakyo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect(err => {
  console.log("connect error:", err);
  const productCollection = client.db("vipDigitalShop").collection("products");
  const addOrderProductCollection = client.db("vipDigitalShop").collection("addOrder");
  const orderCollection = client.db("vipDigitalShop").collection("order");

  //data get on server
  app.get("/products", (req, res) => {
    productCollection.find().toArray((err, items) => {
      res.send(items);
    })
  });

  // data post in server
  app.post("/addProduct", (req, res) => {
    const newProduct = req.body;
    console.log("add new product:", newProduct);
    productCollection.insertOne(newProduct).then((result) => {
      console.log("insert product", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.post('/addOrder', (req, res) => {
    addOrderProductCollection.insertOne(req.body)
        .then(result => {
          res.send(result);
        })
})

app.get('/orderProducts/:email', (req, res) => {
  const { email } = req.params
  addOrderProductCollection.find({ email })
      .toArray((error, result) => {
          res.send(result)
          // console.log(result);
      })
})

app.get('/getOrder/:email', (req, res) => {
  const { email } = req.params
  orderCollection.find({ email })
      .toArray((error, result) => {
          res.send(result)
      })
})

  app.post('/productsById', async (req, res) => {
    const productId = await req.body
    const productDetail = productId.map(item => {
        return ObjectID(item)
    })
    productCollection.find({ _id: { $in: productDetail } })
        .toArray((error, result) => {
            console.log(error);
            res.send(result)
        })
})
app.post('/checkoutOrder', (req, res) => {
  orderCollection.insertOne(req.body)
  .then(result => {
    console.log('added', result);
    addOrderProductCollection.deleteMany({ email: req.body.email })
        .then(result => {
            console.log('deleted', result);
        })
})
  //client.close(); 
});

 //delete product
  app.delete("/deleteEvent/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    console.log("delete", id);
    productCollection.findOneAndDelete({ _id: id })
    .then( docs => {
      res.send(!!docs.value[0])
    });
  });


// console.log(process.env.DB_USER);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port)
});
