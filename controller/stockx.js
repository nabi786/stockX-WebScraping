const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");

//  // // // // // // // // // // // // // // // // // // //
//
//
//
//
// function to Scrap Product Events Data
//
//
//
// // // // // // // // // // // // // // // // // // // //
var getSizes = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    // scraping logic comes here…
    const page = await browser.newPage();
    await page.goto(url);

    await page.click("#menu-button-pdp-size-selector");
    await page.waitForSelector(".chakra-menu__menu-list");
    await page.click(".css-qip28k:last-child");
    await page.waitForSelector(".chakra-menu__menu-list");
    const dynamicData = await page.evaluate(() => {
      const dataElement = document.querySelector(".chakra-menu__menu-list");
      return dataElement.innerText;
    });

    // console.log(dynamicData);
    await browser.close();

    //  handle catch Error

    return { success: true, dynamicData };
  } catch (err) {
    return { success: false, msg: "invalid Size and Prices" };
  }
};

//  // // // // // // // // // // // // // // // // // // //
//
//
//
//
// function to Scrap the Product Details Like, Name, Description etc
//
//
//
// // // // // // // // // // // // // // // // // // // //
const getScrapData = async (productName) => {
  try {
    var url = "https://stockx.com/nike-air-max-97-og-silver-bullet-2022";

    var productName;
    axios
      .get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
        },
      })
      .then(async (response) => {
        let $ = cheerio.load(response.data);

        var findName = $(".css-exht5z").text();
        productName = findName;
      })
      .catch((err) => {
        console.log("this is erro", err.message);
      });

    var sizeAndPrices = await getSizes(url);

    if (sizeAndPrices.success == true) {
      return {
        success: true,
        Name: productName,
        size: sizeAndPrices.dynamicData,
      };
    } else {
      return { success: false, Name: productName, size: [] };
    }
  } catch (err) {
    return { success: false, msg: "Product Not Found with this name" };
  }
};

//  // // // // // // // // // // // // // // // // // // //
//
//
//
//
// function to search proudct by Name (Main API)
//
//
//
// // // // // // // // // // // // // // // // // // // //

const findProudctByName = async (req, res) => {
  try {
    var productName = req.body.proudctName;
    var result = await getScrapData();

    console.log("this is result", result);
    if (result.success == true) {
      res
        .status(200)
        .json({ success: true, ProductName: result.Name, Size: result.size });
    } else {
      res.status(404).json({ success: false, msg: result.msg });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "something went wrong  from server" });
  }
};

// exporting module
const object = { findProudctByName };
module.exports = object;
