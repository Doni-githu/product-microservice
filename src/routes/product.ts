import { Router, Request, json, NextFunction } from "express";
import Product from "../models/product";
import path from "path"
import amqp from "amqplib"
import fs from "fs"
import { v4 as uuidV4, v5 as uuidV5 } from "uuid"
import multer from "multer"
import { IBody, IResult } from "../interfaces/types";
import { IRequest } from "../interfaces/user.interface";
import { IProduct } from "../interfaces/product.interface";
import url from "../helpers/url";
const router = Router()



async function consume() {
    let result: IResult;
    const amqpServer = "amqp://localhost"

    const connection = await amqp.connect(amqpServer)
    const channel = await connection.createChannel()

    await channel.assertExchange('logger', 'direct')

    let q = await channel.assertQueue('ReceiveQueue')
    await channel.bindQueue(q.queue, "logger", "Receive")


    await channel.consume(q.queue, (msg) => {
        const user = JSON.parse(msg.content.toString())
        result = user
        channel.ack(msg)
    })

    channel.close()
    connection.close()
    return result
}
async function publish(auth: string) {
    const amqpServer = "amqp://localhost"
    const connection = await amqp.connect(amqpServer)
    const channel = await connection.createChannel()
    await channel.assertExchange('logger', 'direct')
    let data = {
        token: auth.split(' ')[1]
    }
    await channel.publish('logger', 'Rush', Buffer.from(JSON.stringify(data)))
}


router.get('/all', async (req, res) => {
    const all = await Product.find()
    res.status(200).json(all)
})

const storage = multer.diskStorage({
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error, filename: string) => void) => {
        cb(null, uuidV5.DNS + uuidV5.URL + file.originalname)
    },
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        let p = path.join(__dirname, '..', '..', 'public', 'images')
        cb(null, p)
    }
})

const upload = multer({
    storage
})

router.post('/create', upload.single('src'), async (req: IRequest, res) => {
    if (!req.headers.authorization) {
        res.status(400).json({
            message: 'Not authorizate'
        })
        return
    }


    if (!req.file) {
        res.status(500).json({
            message: 'some things went wrong'
        })
        return
    }

    let name = req.file.path.split('\\').reverse()[0]
    let body = req.body as IBody

    const data = {
        src: `${url}/${name}`,
        ...body,
        user: {
            username: req.user.username,
            _id: req.user._id
        }
    }

    let data2 = await Product.create(data)
    res.status(200).json(data2)
})


router.delete('/delete/:id', async (req: IRequest, res, next: NextFunction) => {
    let id = req.params.id
    const oldProduct = await Product.findById<IProduct>(id)
    if (!oldProduct) {
        res.status(404).json({
            message: 'Your product not found'
        })
        return
    }

    if (oldProduct.user._id !== req.user._id) {
        res.status(400).json({
            message: 'You could not delete this product because you are not created this'
        })
        next()
        return
    }

    let name = oldProduct.src.replace(`${url}/`, '')
    let p = path.join(__dirname, '..', '..', 'public', 'images', name)
    fs.rm(p, (err) => {
        console.log(err);
    })
    await Product.findByIdAndRemove(req.params.id, { new: true })
    res.status(200).json({
        message: 'Ok'
    })
})

router.get('/:id', async (req, res) => {
    const found = await Product.findById<IProduct>(req.params.id)
    if (!found) {
        res.status(404).json({
            message: 'Your product not found'
        })
        return
    }

    res.status(200).json(found)
})

router.put('/update/:id/text', async (req: IRequest, res) => {
    const { id } = req.params
    const oldProduct = await Product.findById<IProduct>(id)

    if (!oldProduct) {
        res.status(404).json({
            message: 'Your product not found'
        })
        return
    }

    if (oldProduct.user._id !== req.user._id) {
        res.status(400).json({
            message: 'You could not edit this product because you are not created this'
        })
        return
    }



    await Product.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).send({
        message: 'Ok'
    })
})

router.put('/update/:id/image', upload.single('src'), async (req: IRequest, res) => {
    const { id } = req.params

    const oldProduct = await Product.findById(id)
    if (!oldProduct) {
        res.status(404).json({
            message: 'Your product not found'
        })
        return
    }

    if (req.user._id !== oldProduct.user._id) {
        res.status(400).json({
            message: 'You could not edit this product image because you are not created this product'
        })
        return
    }

    const name = oldProduct.src.replace(`${url}/`, '')
    let p = path.join(__dirname, '..', '..', 'public', 'images', name)

    fs.rm(p, (err) => {
        console.log(err);
    })

    const filename = req.file.filename

    const src = `${url}/${filename}`

    await Product.findByIdAndUpdate(id, { src })
    res.status(200).json({
        message: 'Ok'
    })
})

export default router