const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema({
    link: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    }, 
    img: {
        type: String
    }, 
    saved: {
        type: Boolean,
        default: false
    },
})

const Articles = mongoose.model("Articles", articleSchema);

module.exports = Articles;