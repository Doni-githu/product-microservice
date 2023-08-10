"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    title: String,
    description: String,
    price: Number,
    src: String,
    user: {
        username: String,
        _id: String,
    }
}, { timestamps: true });
const Product = (0, mongoose_1.model)('Product', ProductSchema);
exports.default = Product;
//# sourceMappingURL=product.js.map