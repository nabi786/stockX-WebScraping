const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");
// const puppeteer = require("puppeteer-core");

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
  } catch (err) {
    console.log("error in puputor pakcage", err);
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
    var url = `https://stockx.com/${productName}`;

    var lastSale;
    var productName;
    var sizeData;
    axios
      .get(url, {
        headers: {
          Authorization: "stockx.com",
          "Content-Type": "application/json, text/plain ",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
        },
      })
      .then(async (response) => {
        let $ = cheerio.load(response.data);

        var findName = await $(".css-exht5z").text();
        var lSale = await $(".css-wpoilv .css-13uklb6").text();
        console.log("this is last Sale", lSale);
        productName = findName;
        lastSale = lSale;
      })
      .catch((err) => {
        console.log("this is erro", err.message);
      });

    // load pupeteer

    const browser = await puppeteer.launch({
      // executablePath:
      // "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: "new",
    });
    // scraping logic comes here…
    const page = await browser.newPage();
    await page.goto(url);
    await page.click("#menu-button-pdp-size-selector");
    await page.waitForSelector(".chakra-menu__menu-list");
    await page.click(".css-qip28k:last-child");
    await page.waitForSelector(".chakra-menu__menu-list");
    const dynamicData = await page.evaluate(() => {
      const dataElement = document.querySelector(".css-1o6kz7w");
      return dataElement.innerText;
    });
    // console.log(dynamicData);
    await browser.close();
    //  handle catch Error
    // dynamicData = dynamicData.toString();
    var array1 = Array.from(dynamicData);
    var array = [];
    var onELM = "";
    array1.forEach((item, index) => {
      if (item != "\n") {
        onELM += item;
      } else {
        array.push(onELM);
        onELM = "";
      }
    });
    console.log(array);
    sizeData = array;

    // await new Promise((resolve) => {
    //   return setTimeout(resolve, 10000);
    // });
    console.log("this is sizeData", sizeData);
    return {
      success: true,
      Name: productName,
      lastSale: lastSale,
      size: array,
    };
  } catch (err) {
    console.log(err);
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
    var productName = req.body.productName;
    console.log(productName);
    productName = productName.replace(/\s+/g, "-").toLowerCase();
    productName = productName.replace(")", "");
    productName = productName.replace("(", "");
    // console.log(productName);
    var result = await getScrapData(productName);

    console.log("this is result", result);
    if (result.success == true) {
      res.status(200).json({
        success: true,
        ProductName: result.Name,
        lastSale: result.lastSale,
        Size: result.size,
      });
    } else {
      res.status(404).json({ success: false, msg: result.msg });
    }
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ success: false, msg: "something went wrong  from server" });
  }
};

// exporting module
const object = { findProudctByName };
module.exports = object;
