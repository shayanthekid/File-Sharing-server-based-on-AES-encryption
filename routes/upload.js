const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');


router.get('/upload', (req, res) => {
    res.render("upload", );
});
router.get('/download/:id', fileController.downloadFile);

router.post('/createfile', fileController.uploadFile);

router.get('/getAllFiles', fileController.getAllFiles);


module.exports = router;