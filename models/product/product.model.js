const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    category: {
        type: String,
        require: true
    },
    price: {
        type: String,
        require: true
    },
    unit: {
        type: Number,
        require: true
    },
    available: {
        type: Boolean,
        default: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Product', productSchema);