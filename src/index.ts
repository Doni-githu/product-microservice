import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import ProductRoutes from "./routes/product"
import path from "path"
import AuthMiddleware from "./middleware/auth"
dotenv.config()
const app = express()

app.use(express.static(path.join(__dirname, '..', 'public', 'images')))


app.use(express.json())

app.use("/api/product", ProductRoutes)

function Run(): void {
    const PORT = process.env.PORT || 9000
    mongoose.connect(process.env.MONGO_GLOBAL_URI)
        .then((res) => console.log('Mongo DB connect in product service'))
        .catch((err) => console.log(`Mongo DB could not connected in auth service, because ${err}`))
    app.listen(PORT, () => {
        console.log(`product server running on port ${PORT}`)
    })
}

Run()
