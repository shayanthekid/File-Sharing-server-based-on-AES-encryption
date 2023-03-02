const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');


router.get('/upload', (req, res) => {
    res.render("upload", );
});

router.post('/createfile', fileController.uploadFile);



module.exports = router;