import mongoose from "mongoose";

const connection = mongoose.connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hpc9dza.mongodb.net/?retryWrites=true&w=majority`
);

export default connection;
