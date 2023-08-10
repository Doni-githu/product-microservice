import { Request } from "express";

export interface IUser {
    username: string,
    email: string,
    password: string,
    _id: string,
    __v: number
}

export interface IUser2 extends IUser {
    createdAt: string,
    updatedAt: string
}

export interface IRequest extends Request {
    user: IUser
}