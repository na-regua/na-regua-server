import mongoose from "mongoose";

const connection = mongoose.connect(process.env.DB_URL || "");

export default connection;
