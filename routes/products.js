const express = require("express");

const router = express.Router();
const stockXProudcts = require("../controller/stockx");

router.post("/stockXProudcts", stockXProudcts.findProudctByName);

module.exports = router;
