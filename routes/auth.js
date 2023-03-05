const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bodyParser = require('body-parser');


router.use(bodyParser.urlencoded({ extended: true }));

// Route for showing the signup form
router.get('/signup', (req, res) => {
    res.render("signup", { errorMsg: "Invalid username or password", user: req.session.user });
});

router.post('/createuser', authController.signup);

// Route for showing the login form
router.get('/login', (req, res) => {
    res.render('login', { errorMsg: "Invalid username or password", user: req.session.user });
});


// Route for handling the login form submission
router.post('/loginuser', authController.login);

router.get('/logout', authController.logout);


module.exports = router;