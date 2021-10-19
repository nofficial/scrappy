var { gfycat, redgifs } = require("gfycat-api");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("dotenv").config();
var NewRed = require("./NewDataSchema");
const db = mongoose.connection;
db.on("error", (e) => console.log(`error is ${e}`));
db.once("open", () => console.log("Database is connected"));
const redg = new Schema({
  _id: {
    type: String
  },
  url: {
    type: String
  }
});

let Redg = mongoose.model("RedG_horiz", redg);



(async () => {
  await mongoose.connect(process.env.DB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })


  console.log("dss");
  var highestSerial = await NewRed.find({}, {serialCount: 1}).sort({serialCount: -1}).limit(10);
  highestSerial = highestSerial[0].serialCount +1;
  var data = await Redg.find({}).skip(0).limit(30)

  console.log(data, highestSerial);
  for (let i = 0; i < data.length; i++) {
    try {
      const post = await redgifs.getPost(data[i]._id);
      // console.log(post.tags);
      let insertData = { _id: data[i]._id, redgID: post.id, searchIndex: post.tags.length ? post.tags.join(" | ") : "unknown", fullData: post, serialCount: highestSerial }
      let finalData = new NewRed(insertData)
      await finalData.save();
      console.log(insertData.serialCount, insertData.redgID);
      highestSerial ++;
    } catch (e) {
      console.log("-----", e.message);
    }
  }

  // const post = await redgifs.getPost("cooperativevapidflatcoatretriever");
  // console.log(post);
//   db.close()
})()


