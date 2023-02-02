const express = require('express');
const session = require("express-session");
const {SECRET} = require("../config/configENV");
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(session({secret: SECRET, resave: true, saveUninitialized: true}));

router.get('/', (request, response) => {
    // If the user is loggedin
    if (request.session.loggedin) {
        // Output username
        response.render('home', {layout : 'home'});
    } else {
        // Not logged in
        response.render('home', {layout : 'login'});
    }
});

module.exports = router;