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

router.get('/', (req, res)=>{
    res.render('home', {layout : 'register'});
})

router.post("/", async (req,res) => {
    const user = req.body.username;
    const hashedPassword = await bcrypt.hash(req.body.password,10);
    db.getConnection(  (err, connection) => {
        if (err) throw (err)
        const sqlSearch = "SELECT * FROM userTable WHERE user = ?"
        const search_query = mysql.format(sqlSearch,[user])
        const sqlInsert = "INSERT INTO userTable VALUES (0,?,?)"
        const insert_query = mysql.format(sqlInsert,[user, hashedPassword])

        connection.query (search_query,  (err, result) => {
            if (err) throw (err)
            console.log(result.length)
            if (result.length != 0) {
                connection.release()
            }
            else {
                connection.query (insert_query, (err, result)=> {
                    connection.release()
                    if (err) throw (err)
                    console.log ("Created new User")
                    console.log(result.insertId);
                    res.render('home', {layout : 'login'});
                })
            }
        })
    })
});

module.exports = router;