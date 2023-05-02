const cheerio = require("cheerio");
const axios = require("axios");
// const puppeteer = require("puppeteer");
const puppeteer = require("puppeteer-core");
const StockXAPI = require("stockx-api");

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
    var isEmlAvail = true;
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

    // pupeteer package
    const browser = await puppeteer.launch({
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: false,
    });
    // scraping logic comes here…
    const page = await browser.newPage();
    await page.goto(url);

    if ($("#menu-button-pdp-size-selector").length) {
      await page.click("#menu-button-pdp-size-selector");
      await page.waitForSelector(".chakra-menu__menu-list");

      // var elm = $(".css-1v4g4sv");

      var buttonStack = await page.evaluate(() => {
        const dataElement = document.querySelector(".css-1v4g4sv");

        return dataElement.innerText;
      });

      if (buttonStack.length > 2) {
        var stackItems = Array.from(buttonStack);
        var emptyStr = "";
        stackItems.forEach((item, index) => {
          if (item != "\n") {
            emptyStr += item;
          } else {
            emptyStr += "/";
          }
        });
        var emptyAry = emptyStr.split("/");
        console.log("this is empty Ar ", emptyAry);
        var isElmAvailble = [
          { isVal: false, value: 1 },
          { isVal: false, value: 2 },
          { isVal: false, value: 3 },
          { isVal: false, value: 4 },
          { isVal: false, value: 5 },
          { isVal: false, value: 6 },
          { isVal: false, value: 8 },
          { isVal: false, value: 9 },
        ];

        await page.click(`.css-qip28k:nth-child(2)`);
        await page.waitForSelector(".chakra-menu__menu-list");
        var dynamicData = await page.evaluate(() => {
          const dataElement = document.querySelector(".css-1o6kz7w");
          return dataElement.innerText;
        });

        // console.log(dynamicData);
        //  handle catch Error
        // dynamicData = dynamicData.toString();
        var array1 = Array.from(dynamicData);
        var array = [];
        var onELM = "";
        array1.forEach((item, index) => {
          if (item != "\n") {
            onELM += item;
          } else {
            onELM += "/";
          }
        });
        onELM = onELM.split("/");
        sizeData.push(onELM);
        // }
        console.log(sizeData);
        await browser.close();
      } else {
        dynamicData = await page.evaluate(() => {
          const dataElement = document.querySelector(".css-1o6kz7w");
          return dataElement.innerText;
        });

        await browser.close();
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
        // console.log(array);
        sizeData = array;
        console.log("stack of size buttions not availables");
      }
    } else {
      sizeData = [];
      await browser.close();
    }

    return {
      success: true,
      Name: productName,
      retailPrice: retailPrice,
      size: sizeData,
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
        RetailPrice: result.retailPrice,
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
