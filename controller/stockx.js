require("dotenv").config();
const cheerio = require("cheerio");
const axios = require("axios");
// const puppeteer = require("puppeteer");
const sizeChat = require("../ProductsSizes/SizesChart");
// const chromium = require("chromium");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

//
const convertCurrency = (symbol, Amount) => {
  var exchangeRateEuroPrice = "0.90";
  var euroSymbol = "€";

  Amount = Amount.replace(",", "");
  console.log("Amount is usd", Number(Amount));
  if (symbol == "$") {
    const convertedAmount = Number(Amount) * Number(exchangeRateEuroPrice);
    return euroSymbol + convertedAmount;
  }
};

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

    var retailPrice;
    var productName;
    var sizeData = [];
    var responseData;
    var CategoryName;
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
        responseData = response.data;
      })
      .catch((err) => {
        console.log("this is erro", err.message);
      });

    await new Promise((resolve) => {
      return setTimeout(resolve, 5000);
    });

    let $ = cheerio.load(responseData);
    var findName = await $(".css-exht5z").text();
    productName = findName;
    var CategoryName = await $(
      ".chakra-breadcrumb ol li:nth-child(4) a"
    ).text();

    var elements;
    if ($(".css-1ufjsin").length) {
      elements = $(".css-1ufjsin");
    } else {
      elements = $(".css-101wtdy");
    }

    var lSale = "";
    elements.each((index, element) => {
      var innerText = $(element).text();
      // console.log("innerText", innerText);
      if (innerText.includes("Retail Price") == true) {
        lSale = innerText;
      }
    });

    lSale = lSale.split("$");
    lSale = lSale[1];
    console.log("lSale price", lSale);
    var price = convertCurrency("$", lSale);
    retailPrice = price;

    console.log("this is Path ", process.env.PUPPETEER_EXECUTABLE_PATH);
    // pupeteer package s

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    // scraping logic comes her
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 10000 });

    if ($("#menu-button-pdp-size-selector").length) {
      await page.click("#menu-button-pdp-size-selector");
      await page.waitForSelector(".chakra-menu__menu-list");

      // var elm = $(".css-1v4g4sv");

      var sizesArry = [];
      const sizeButtons = await page.$$(".css-qip28k");

      const alreadySizedButtosn = await page.$$(
        ".css-1kgaafq .css-1o6kz7w button"
      );

      console.log("sizeButtons", alreadySizedButtosn.length);
      for (var x = 0; x < alreadySizedButtosn.length; x++) {
        var elmIndex = x + 1;
        var data = await page.$eval(
          `.css-1kgaafq .css-1o6kz7w button:nth-child(${elmIndex})`,
          (data) => data.textContent
        );
        sizesArry.push(data);
      }

      if (sizeButtons.length != 0) {
        for (let button of sizeButtons) {
          await button.click();

          await page.waitForSelector(".css-1kgaafq");
          const sizeButtonsOneByOne = await page.$$(
            ".css-1kgaafq .css-1o6kz7w button"
          );

          console.log("length of buttons", sizeButtonsOneByOne.length);

          // sized for other buttions
          for (var x = 0; x < sizeButtonsOneByOne.length; x++) {
            var elmIndex = x + 1;
            var data = await page.$eval(
              `.css-1kgaafq .css-1o6kz7w button:nth-child(${elmIndex})`,
              (data) => data.textContent
            );
            sizesArry.push(data);
          }
        }

        sizeData = sizesArry;
        await browser.close();
      } else {
        sizeData = sizesArry;
        await browser.close();
      }
    } else {
      sizeData = [];
      await browser.close();
    }

    var exactSizesEU = [];
    var exactSizesUS = [];

    // getting sized of EU

    console.log("sizeData", sizeData);
    sizeData.forEach((item, inex) => {
      if (item.search("EU") != -1) {
        exactSizesEU.push(item);
      }
    });

    CategoryName = CategoryName.toLowerCase();
    console.log("exactSizesEU ", exactSizesEU);
    if (exactSizesEU.length == 0) {
      // var sizesArrayByCategory = sizeChat.CategoryName;
      var chartTableArry = sizeChat.sizechart;

      chartTableArry.forEach((item, index) => {
        if (item[0] == CategoryName) {
          item[1].forEach((item2, index) => {
            exactSizesEU.push(item2);
          });
        }
      });
    }

    return {
      success: true,
      Name: productName,
      retailPrice: retailPrice,
      sizeEU: exactSizesEU,
      sizeUS: exactSizesUS,
    };
  } catch (err) {
    console.log(err);
    return { success: false, msg: err.message };
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
        RetailPrice: result.retailPrice,
        sizeEU: result.sizeEU,
        sizeUS: result.sizeUS,
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
