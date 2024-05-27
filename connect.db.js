import mongoose from "mongoose";
const dbName = process.env.DB_NAME;
const dbUserName = process.env.DB_USER_NAME;
const dbPassword = process.env.DB_PASSWORD;

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://prakash11141:angryme@cluster0.fbsm3wg.mongodb.net/profitness?retryWrites=true&w=majority`
    );

    console.log("DB connection established...");
  } catch (error) {
    console.log("DB connection failed...");
    console.log(error.message);
  }
};

export default connectDB;
