import { Response, NextFunction } from "express";
import Token from "../utils/token";
import { IRequest, IUser } from "../interfaces/user.interface";
import axios from "axios";


export default async function (req: IRequest, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
        res.status(400).json({
            message: 'not authorized'
        })
        return
    } else {
        axios.get('http://localhost:8000/api/auth/auth', {
            headers: { Authorization: req.headers.authorization }
        }).then((res) => {
            req.user = res.data
            next()
        }).catch(() => {
            res.status(400).json({
                message: 'not authorized'
            })
        })
    }
}