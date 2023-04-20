const axios = require("axios");
const cheerio = require("cheerio");

// function to search proudct by Name
const findProudctByName = async (req, res) => {
  try {
    // console.log("this is result", result);

    // console.log("function working properly");
    res.status(200).json({ success: true, data: [] });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "something went wrong  from server" });
  }
};

// exporting module
const object = { findProudctByName };
module.exports = object;
