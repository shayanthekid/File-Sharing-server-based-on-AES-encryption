const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');


router.get('/upload', (req, res) => {

    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    res.render("upload", { user: req.session.user }  );
});
router.get('/download/:id', fileController.downloadFile);

router.post('/createfile', fileController.uploadFile);

router.get('/getAllFiles', (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    fileController.getAllFiles(req, res);
});


module.exports = router;