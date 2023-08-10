import { IUser2 } from "./user.interface"

export interface IProduct {
    title: string,
    description: string
    src: string,
    price: number,
    _id: string,
    __v: number,
    updatedAt: string,
    createdAt: string,
    user: Pick<IUser2, "_id" | "username">
}