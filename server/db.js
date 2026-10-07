import { MongoClient } from "mongodb";
const client = new MongoClient(process.env.MONGODB_URI);
let db;
export async function conectar() {
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("Conectado ao MongoDB");
}

export function getDb() {
    return db;
}