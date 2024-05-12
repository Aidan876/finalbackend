import { Request, Response } from "express";
import Shop from "../models/shop";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import Order from "../models/order";

const getMyShop = async (req: Request, res: Response) => {
  try {
    const shop = await Shop.findOne({ user: req.userId });
    if (!shop) {
      return res.status(404).json({ message: "shop not found" });
    }
    res.json(shop);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching shop" });
  }
};

const createMyShop = async (req: Request, res: Response) => {
  try {
    const existingShop = await Shop.findOne({ user: req.userId });

    if (existingShop) {
      return res.status(409).json({ message: "User shop already exists" });
    }

    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const shop = new Shop(req.body);
    shop.imageUrl = imageUrl;
    shop.user = new mongoose.Types.ObjectId(req.userId);
    shop.lastUpdated = new Date();
    await shop.save();

    res.status(201).send(shop);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateMyShop = async (req: Request, res: Response) => {
  try {
    const shop = await Shop.findOne({
      user: req.userId,
    });

    if (!shop) {
      return res.status(404).json({ message: "shop not found" });
    }

    shop.shopName = req.body.shopName;
    shop.city = req.body.city;
    shop.country = req.body.country;
    shop.deliveryPrice = req.body.deliveryPrice;
    shop.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    shop.filters = req.body.filters;
    shop.menuItems = req.body.menuItems;
    shop.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      shop.imageUrl = imageUrl;
    }

    await shop.save();
    res.status(200).send(shop);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getMyShopOrders = async (req: Request, res: Response) => {
  try {
    const shop = await Shop.findOne({ user: req.userId });
    if (!shop) {
      return res.status(404).json({ message: "shop not found" });
    }

    const orders = await Order.find({ shop: shop._id })
      .populate("shop")
      .populate("user");

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    const shop = await Shop.findById(order.shop);

    if (shop?.user?._id.toString() !== req.userId) {
      return res.status(401).send();
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "unable to update order status" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

export default {
  updateOrderStatus,
  getMyShopOrders,
  getMyShop,
  createMyShop,
  updateMyShop,
};
