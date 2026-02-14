import { connect } from "mongoose";


const mongo_url = process.env.MONGODB_URL;

if(!mongo_url){
    console.error("MONGODB_URL environment variable is not set.");
    process.exit(1);
}

let cache = global.mongoose;

if(!cache){
    cache = global.mongoose = {
        conn: null,
        promise: null
    }
}


const connectToDB = async () => {
    if(cache.conn){
        return cache.conn;
    }

    if(!cache.promise){
        cache.promise = connect(mongo_url).then((c) => c.connection);
    }
    
    // if promise then resolve it
    try {
        cache.conn = await cache.promise;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        cache.promise = null;
    }

    return cache.conn;
}

export default connectToDB;