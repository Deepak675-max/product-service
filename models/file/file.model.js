const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    fieldname: {
        type: String,
        require: true
    },
    originalname: {
        type: String,
        require: true
    },
    encoding: {
        type: String,
        require: true
    },
    mimetype: {
        type: String,
        require: true
    },
    destination: {
        type: String,
        require: true
    },
    filename: {
        type: String,
        require: true
    },
    path: {
        type: String,
        require: true
    },
    size: {
        type: Number,
        require: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
})


module.exports = mongoose.model('File', fileSchema);
