import express from "express";
import {
  isSeller,
  isBuyer,
  isUser,
} from "../middleware/authentication.middleware.js";
import { addProductValidationSchema } from "./product.validation.js";
import Product from "./product.model.js";
import { checkMongoIdValidityFromParams } from "../middleware/mongo.id.validity.middleware.js";
import { paginationValidationSchema } from "../utils/pagination.validation.js";

const router = express.Router();

router.post(
  "/product/add",
  isSeller,
  async (req, res, next) => {
    // extract new product from req.body
    const newProduct = req.body;

    // validate new product
    try {
      const validatedData = await addProductValidationSchema.validate(
        newProduct
      );
      req.body = validatedData;
      next();
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error.message });
    }
  },
  async (req, res) => {
    // extract new product from req.body
    const newProduct = req.body;

    // add sellerId
    newProduct.sellerId = req.loggedInUserId;

    // create product
    await Product.create(newProduct);

    // send response
    return res.status(200).send({ message: "Product is added successfully." });
  }
);
//get product detail
router.get(
  "/product/details/:id",
  isUser,
  checkMongoIdValidityFromParams,
  async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).send({ message: "Product does not exists." });
    }
    return res.status(200).send({ message: "Success", producDetails: product });
  }
);
//delete product delete
router.delete(
  "/product/delete/:id",
  isSeller,
  checkMongoIdValidityFromParams,
  async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).send({ message: "Product doesn't exists." });
    }
    const isOwnerOfProduct =
      String(product.sellerId) === String(req.loggedInUserId);

    // if not owner of product, throw error
    if (!isOwnerOfProduct) {
      return res
        .status(403)
        .send({ message: "You are not owner of this product." });
    }
    await Product.deleteOne({ _id: productId });
    return res
      .status(200)
      .send({ message: "Product is deleted successfully." });
  }
);

//update product
router.put(
  "/product/edit/:id",
  isSeller,
  checkMongoIdValidityFromParams,
  async (req, res, next) => {
    const newProduct = req.body;
    try {
      const validatedData = await addProductValidationSchema.validate(
        newProduct
      );
      req.body = validatedData;

      next();
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  },
  async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(400).send({ message: "Product doesn't exists." });
    }
    const isOwnerOfProduct = product.sellerId.equals(req.loggedInUserId);
    if (!isOwnerOfProduct) {
      return res
        .status(403)
        .send({ message: "You are not the owner of this product." });
    }
    const newValues = req.body;
    await Product.updateOne(
      {
        _id: productId,
      },
      {
        $set: {
          ...newValues,
        },
      }
    );
    return res
      .status(200)
      .send({ message: "Product is updated successfully." });
  }
);

// get product list by buyer
router.post(
  "/product/list/buyer",
  isBuyer,
  async (req, res, next) => {
    // extract pagination data from req.body
    const paginationData = req.body;

    // validate pagination data
    try {
      const validatedData = await paginationValidationSchema.validate(
        paginationData
      );
      req.body = validatedData;
      next();
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  },
  async (req, res) => {
    // extract pagination data from req.body
    const { page, limit, searchText, category, minPrice, maxPrice } = req.body;

    // calculate skip
    const skip = (page - 1) * limit;

    let match = {};

    if (searchText) {
      match = { ...match, name: { $regex: searchText, $options: "i" } };
    }

    if (category) {
      match = { ...match, category: category };
    }

    if (minPrice >= 0 && maxPrice) {
      match = { ...match, price: { $gte: minPrice, $lte: maxPrice } };
    }

    // run query
    const productList = await Product.aggregate([
      { $match: match },

      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          name: 1,
          brand: 1,
          price: 1,
          description: { $substr: ["$description", 0, 150] },
          image: 1,
          sellerId: 1,
        },
      },
    ]);

    const totalProducts = await Product.find(match).countDocuments();
    const numberOfPages = Math.ceil(totalProducts / limit);

    return res
      .status(200)
      .send({ message: "success", productList: productList, numberOfPages });
  }
);

// get product list by seller
router.post(
  "/product/list/seller",
  isSeller,
  async (req, res, next) => {
    // extract pagination data from req.body
    const paginationData = req.body;

    // validate pagination data
    try {
      const validatedData = await paginationValidationSchema.validate(
        paginationData
      );
      req.body = validatedData;
      next();
    } catch (error) {
      return res.status(400).send({ message: error.message });
    }
  },
  async (req, res) => {
    // extract pagination data from req.body
    const { page, limit, category, minPrice, maxPrice } = req.body;

    // calculate skip
    const skip = (page - 1) * limit;

    let match = { sellerId: req.loggedInUserId };

    if (category) {
      match = { ...match, category };
    }

    if (minPrice > 0 && maxPrice) {
      match = { ...match, price: { $gte: minPrice, $lte: maxPrice } };
    }

    // run query
    const productList = await Product.aggregate([
      {
        $match: match,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          name: 1,
          brand: 1,
          description: { $substr: ["$description", 0, 150] },
          image: 1,
          price: 1,
        },
      },
    ]);

    return res
      .status(200)
      .send({ message: "success", productList: productList });
  }
);

// get latest product
router.get("/product/list/latest", isUser, async (req, res) => {
  const products = await Product.aggregate([
    {
      $match: {},
    },
    {
      $sort: { createdAt: -1 },
    },
    { $limit: 5 },
    {
      $project: {
        image: 1,
        name: 1,
        price: 1,
        brand: 1,
      },
    },
  ]);

  return res.status(200).send({ message: "success", latestProducts: products });
});

export default router;
