import { Connection } from "mongoose"

declare global {
    var mongoose: {
        conn: Connection | null // The active conncetion, if any
        promise: Promise<Connection> | null // The promise that resolves to the active connection
    }
}

export {}