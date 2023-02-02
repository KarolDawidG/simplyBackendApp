const mysql = require('mysql2');
const {db} = require('./database/connect');
const express = require('express');
const session = require('express-session');
const hbs = require('express-handlebars');
const path = require('path');
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
const {PORT, pass, user, SECRET} = require('./config/configENV');
const {limiter} = require('./config/config');
const app = express();

// to do: fix routes

//midleware				///////////////////////////////////////////////////////////////////////////////////////////////
app.engine('.hbs', hbs.engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.use(limiter);
app.use(session({secret: SECRET, resave: true, saveUninitialized: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 	//dodac aby odczytac dane z formularza
app.use(express.static(path.join(__dirname, 'public')));

// main menu			////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/', (request, response) => {
	response.sendFile(path.join(__dirname + '/public/login.html'));
});

// login		/////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/auth', (request, response)=> {
	response.sendFile(path.join(__dirname + '/public/login.html'));
});
app.post("/auth", (req, res)=> {
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
				res.render('home');
				//res.send("User does not exist!");
			}
			else {
				const hashedPassword = result[0].password
				if (await bcrypt.compare(password, hashedPassword)) {
					console.log("Login Successful")
					req.session.loggedin = true;
					req.session.username = user;
 				res.redirect('/home');
				}
				else {
					console.log("Password Incorrect")
					res.send("Password incorrect!");
				}
			}
		})
	})
})

app.get('/home', (request, response) => {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.sendFile(__dirname + '/public/home.html')
	} else {
		// Not logged in
		response.send('Please login to view this page!');
		response.end();
	}
});

// formularz Kontaktowy			////////////////////////////////////////////////////////////////////////////////////////
app.get('/form', (req, res)=>{
	res.sendFile(__dirname + '/public/contact.html')
})

app.post('/form', (req, res)=>{
   const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: user,
	  pass: pass
	}
  });
  	const mailOptions = {
		from: req.body.email,
		to: user,
		subject: `Meesage from ${req.body.email}: ${req.body.subject}`,

text:
`Email sender: ${req.body.email}		
Name of sender: ${req.body.name}
Subject: ${req.body.subject}\n
Message:\n ${req.body.message}.`
};

  	transporter.sendMail(mailOptions, (error, info)=>{
	if (error) {
   	console.log(error);
   	res.send('error');
		} else {
	 	 console.log('Email sent to ' + mailOptions.to);
	 	 res.send('success');
		}
  	});
	})

// register			///////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/register', (req, res)=>{
		res.sendFile(__dirname + '/public/register.html')
	})

app.post("/register", async (req,res) => {
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
			console.log("------> Search Results")
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
					res.redirect('/');
				})
			}
		})
	})
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
console.log('Start...');
app.listen(PORT, ()=>{console.log(`Server Started on port ${PORT}`)});

/*
npm init -y
npm install express --save
npm install express-session --save
npm install mysql --save or in new version of MySQL S8: npm i mysql2

to set database write:

CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `nodelogin`;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `accounts` (`id`, `username`, `password`, `email`) VALUES (1, 'test', 'test', 'test@test.com');
for example: INSERT INTO accounts (username,password,email) values ('Céline','Dion','c.dion@gmail.com');
or
INSERT INTO accounts (username,password,email) values ('Dupa','dupa','dupa@gmail.com');
*/

//How to get to database? :p
// 1. mysql -u root -p
// 2. SHOW DATABASES;
// 3. USE nodelogin;
// 4. SELECT * FROM accounts;