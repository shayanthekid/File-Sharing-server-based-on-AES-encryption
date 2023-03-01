const express = require("express");
const router = express.Router();
const fileController = require('../controllers/fileController');

router.get("/encrypt/:message", fileController.createFile);

router.get("/decrypt/:encrypted", fileController.getFile);

router.get("/display", fileController.getFiles );

module.exports = router;