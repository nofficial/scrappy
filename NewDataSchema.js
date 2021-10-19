const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vidSchema = new Schema({
  _id: {
    type: String
  },
  redgID: {
    required: true,
    type: String,
  },
  searchIndex: {
      type: String,
      required: true,
      default: "unknown"
  },
  fullData: {
      type: Object,
      required: true
  },
  serialCount: {
      type: Number,
      required: true,
      unique: true
  }
});

module.exports = mongoose.model("full_redg", vidSchema);
