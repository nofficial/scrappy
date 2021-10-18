const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vidSchema = new Schema({
  _id: {
    type: String
  },
  source: {
    required: true,
    type: String,
  },
  tags: {
      type: Array,
      required: true
  },
  tagSearchIndex: {
      type: String,
      required: true
  },
  resolution: {
      type: Object,
      required: true
  }
});

module.exports = mongoose.model("detailed_redg", vidSchema);
