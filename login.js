const mysql = require('mysql2');
const express = require('express');
const session = require('express-session');
const path = require('path');
const nodemailer = require("nodemailer");
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const {hostDB, nameDB, userDB, passDB, PORT, pass, user} = require('./configENV');

const app = express();

const limiter = rateLimit({  
    windowMs: 15*60*1000,   //15 minutes
    max: 100,                // limit each IP to 100 per windowMs
});

const connection = mysql.createConnection({
	host     : hostDB,
	user     : userDB,
	password : passDB, 
	database : nameDB
});

//midleware
app.use(limiter);
app.use(session({secret: 'secret', resave: true, saveUninitialized: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/public/login.html'));
});

app.post('/auth', function(request, response) {
	let username = request.body.username;
	let password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				// Redirect to home page
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
				console.log('Niepoprawne haslo')
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
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

// formularz Kontaktowy
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


app.get('/register', (req, res)=>{
		res.sendFile(__dirname + '/public/register.html')
	})

app.post('/register/', async(request, response)=>{
	const email = request.body.email;
	const username = request.body.username;
	
	try{
		const hashPassword = await bcrypt.hash(request.body.password, 10)
		connection.query(`INSERT INTO accounts (username, password, email) VALUES ("${username}", "${hashPassword}","${email}")`);
		response.redirect('/');
	}catch{
		response.send('Jakis blad');
	}

})
	
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