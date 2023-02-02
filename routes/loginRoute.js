const express = require('express');
const {db} = require("../database/connect");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const router = express.Router();
const session = require('express-session');
const {SECRET} = require("../config/configENV");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(session({secret: SECRET, resave: true, saveUninitialized: true}));

router.get('/', (request, response)=> {
    response.render('home', {layout : 'login'});
});
router.post("/", (req, res)=> {
    const user = req.body.username;
    const password = req.body.password;

    db.getConnection (  (err, connection)=> {
        if (err) throw (err)
        const sqlSearch = "Select * from userTable where user = ?"
        const search_query = mysql.format(sqlSearch,[user])
        connection.query (search_query, async (err, result) => {
            connection.release()
            if (err) throw (err)
            if (result.length == 0) {
                console.log("User does not exist")
                res.render('home', {layout : 'wrongUser'});	//taki dynamiczny redirect
            }
            else {
                const hashedPassword = result[0].password
                if (await bcrypt.compare(password, hashedPassword)) {
                    console.log("Login Successful")
                    req.session.loggedin = true;
                    req.session.username = user;
                    res.render('home', {layout : 'home'});
                }
                else {
                    console.log("Password Incorrect")
                    res.render('home', {layout : 'wrongPass'});
                }
            }
        })
    })
})

module.exports = router;