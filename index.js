import express from "express";
import connectDB from "./connect.db.js";
import userRoutes from "./user/user.route.js";
import productRoutes from "./product/product.route.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

await connectDB();

app.use(userRoutes);
app.use(productRoutes);

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`App is listenin to port ${PORT}`);
});
