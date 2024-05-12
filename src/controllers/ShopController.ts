import { Request, Response } from "express";
import Shop from "../models/shop";

const getShop = async (req: Request, res: Response) => {
  try {
    const shopId = req.params.shopId;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "shop not found" });
    }

    res.json(shop);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

const searchShop = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;

    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedFilters = (req.query.selectedFilters as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    let query: any = {};

    query["city"] = new RegExp(city, "i");
    const cityCheck = await Shop.countDocuments(query);
    if (cityCheck === 0) {
      return res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      });
    }

    if (selectedFilters) {
      const filtersArray = selectedFilters
        .split(",")
        .map((filter) => new RegExp(filter, "i"));

      query["filters"] = { $all: filtersArray };
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { shopName: searchRegex },
        { filters: { $in: [searchRegex] } },
      ];
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // sortOption = "lastUpdated"
    const shops = await Shop.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Shop.countDocuments(query);

    const response = {
      data: shops,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  getShop,
  searchShop,
};
