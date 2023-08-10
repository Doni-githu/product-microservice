import jwt, { Jwt } from "jsonwebtoken"


class Token {
    static encode(token: string): string {
        const result = jwt.sign(token, "SOME")
        return result
    }
    static decode(token: string): Jwt {
        return jwt.decode(token, { complete: true })
    }
}

export default Token