import { IUser2 } from "./user.interface"

export interface IResult {
    status: number,
    user?: IUser2
}

export interface IBody {
    title: string,
    description: string,
    price: string
}


