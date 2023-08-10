"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_1 = __importDefault(require("../models/product"));
const path_1 = __importDefault(require("path"));
const amqplib_1 = __importDefault(require("amqplib"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const multer_1 = __importDefault(require("multer"));
const url_1 = __importDefault(require("../helpers/url"));
const router = (0, express_1.Router)();
async function consume() {
    let result;
    const amqpServer = "amqp://localhost";
    const connection = await amqplib_1.default.connect(amqpServer);
    const channel = await connection.createChannel();
    await channel.assertExchange('logger', 'direct');
    let q = await channel.assertQueue('ReceiveQueue');
    await channel.bindQueue(q.queue, "logger", "Receive");
    await channel.consume(q.queue, (msg) => {
        const user = JSON.parse(msg.content.toString());
        result = user;
        channel.ack(msg);
    });
    channel.close();
    connection.close();
    return result;
}
async function publish(auth) {
    const amqpServer = "amqp://localhost";
    const connection = await amqplib_1.default.connect(amqpServer);
    const channel = await connection.createChannel();
    await channel.assertExchange('logger', 'direct');
    let data = {
        token: auth.split(' ')[1]
    };
    await channel.publish('logger', 'Rush', Buffer.from(JSON.stringify(data)));
}
router.get('/all', async (req, res) => {
    const all = await product_1.default.find();
    res.status(200).json(all);
});
const storage = multer_1.default.diskStorage({
    filename: (req, file, cb) => {
        cb(null, uuid_1.v5.DNS + uuid_1.v5.URL + file.originalname);
    },
    destination: (req, file, cb) => {
        let p = path_1.default.join(__dirname, '..', '..', 'public', 'images');
        cb(null, p);
    }
});
const upload = (0, multer_1.default)({
    storage
});
router.post('/create', upload.single('src'), async (req, res) => {
    if (!req.headers.authorization) {
        res.status(400).json({
            message: 'Not authorizate'
        });
        return;
    }
    if (!req.file) {
        res.status(500).json({
            message: 'some things went wrong'
        });
        return;
    }
    let name = req.file.path.split('\\').reverse()[0];
    let body = req.body;
    const data = {
        src: `${url_1.default}/${name}`,
        ...body,
        user: {
            username: req.user.username,
            _id: req.user._id
        }
    };
    let data2 = await product_1.default.create(data);
    res.status(200).json(data2);
});
router.delete('/delete/:id', async (req, res, next) => {
    let id = req.params.id;
    const oldProduct = await product_1.default.findById(id);
    if (!oldProduct) {
        res.status(404).json({
            message: 'Your product not found'
        });
        return;
    }
    if (oldProduct.user._id !== req.user._id) {
        res.status(400).json({
            message: 'You could not delete this product because you are not created this'
        });
        next();
        return;
    }
    let name = oldProduct.src.replace(`${url_1.default}/`, '');
    let p = path_1.default.join(__dirname, '..', '..', 'public', 'images', name);
    fs_1.default.rm(p, (err) => {
        console.log(err);
    });
    await product_1.default.findByIdAndRemove(req.params.id, { new: true });
    res.status(200).json({
        message: 'Ok'
    });
});
router.get('/:id', async (req, res) => {
    const found = await product_1.default.findById(req.params.id);
    if (!found) {
        res.status(404).json({
            message: 'Your product not found'
        });
        return;
    }
    res.status(200).json(found);
});
router.put('/update/:id/text', async (req, res) => {
    const { id } = req.params;
    const oldProduct = await product_1.default.findById(id);
    if (!oldProduct) {
        res.status(404).json({
            message: 'Your product not found'
        });
        return;
    }
    if (oldProduct.user._id !== req.user._id) {
        res.status(400).json({
            message: 'You could not edit this product because you are not created this'
        });
        return;
    }
    await product_1.default.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).send({
        message: 'Ok'
    });
});
router.put('/update/:id/image', upload.single('src'), async (req, res) => {
    const { id } = req.params;
    const oldProduct = await product_1.default.findById(id);
    if (!oldProduct) {
        res.status(404).json({
            message: 'Your product not found'
        });
        return;
    }
    if (req.user._id !== oldProduct.user._id) {
        res.status(400).json({
            message: 'You could not edit this product image because you are not created this product'
        });
        return;
    }
    const name = oldProduct.src.replace(`${url_1.default}/`, '');
    let p = path_1.default.join(__dirname, '..', '..', 'public', 'images', name);
    fs_1.default.rm(p, (err) => {
        console.log(err);
    });
    const filename = req.file.filename;
    const src = `${url_1.default}/${filename}`;
    await product_1.default.findByIdAndUpdate(id, { src });
    res.status(200).json({
        message: 'Ok'
    });
});
exports.default = router;
//# sourceMappingURL=product.js.map