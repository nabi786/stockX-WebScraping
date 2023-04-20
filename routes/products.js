const express = require("express");

const router = express.Router();
const stockXProudcts = require("../controller/stockx");

router.get("/stockXProudcts", stockXProudcts.findProudctByName);

module.exports = router;
