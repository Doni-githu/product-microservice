import { Schema, model } from "mongoose";

const ProductSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    src: String,
    user: {
        username: String,
        _id: String,
    }  
}, { timestamps: true })

const Product = model('Product', ProductSchema)
export default Product