const mysql = require("mysql2");
const {hostDB, userDB, passDB, nameDB} = require("../config/configENV");


const db = mysql.createPool({
    connectionLimit: 100,
    host     : hostDB,
    user     : userDB,
    password : passDB,
    database : nameDB
});

db.getConnection( (err, connection)=> {
    if (err) throw (err)
    console.log ("DB connected successful.")
})



module.exports = {
    db,
}