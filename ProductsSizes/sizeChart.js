const getSizes = async () => {
  var url = `https://stockx.com/news/shoe-size-conversion-chart/`;

  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    headless: false,
  });
  // scraping logic comes her
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const tableDataRow = await page.$$("#tablepress-180 tbody tr");
  var sizesArry = [];
  for (var x = 0; x < tableDataRow.length; x++) {
    const tableDataRowTD = await page.$$(
      `#tablepress-180 tbody tr:nth-child(${x + 1}) td`
    );

    for (var i = 0; i < tableDataRowTD.length; i++) {
      var data = await page.$eval(
        `#tablepress-180 tbody tr:nth-child(${x + 1}) td:nth-child(${i + 1})`,
        (data) => data.textContent
      );
      // console.log(data);
      sizesArry.push(data);
    }
  }
  console.log("tableData length ", sizesArry);

  browser.close();

  return { sizesArry };
};
