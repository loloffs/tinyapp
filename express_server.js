const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");




app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());


const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" },
  aaaa: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const isEmailTaken = function(email) {
  console.log("email: ", email, "users: ", users);
  for (const key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
}


const isPasswordCorrect = function(email, passwordAttempt) {  
  for (const id in users) {
    if (users[id].email === email) {
      return bcrypt.compareSync(passwordAttempt, users[id].password);
    }
  }
  return false;
}  

const doesUserEmailExist = (email) => {
  for (const id in users) {
    if(users[id].email === email) {
      return true;
    }
  }
  return false;
}

const getIDByEmailPassword = function(email, password) {
for (const id in users)
  if (users[id].email === email && bcrypt.compareSync(password, users[id].password)) {
    return id;
  }
};


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  const userFromCookies = users[req.cookies["user_id"]];
  const urls = {};
  for (const shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === userFromCookies.id) {
      urls[shortUrl] = urlDatabase[shortUrl];
    }
  }
  const templateVars = { urls: urls, user: userFromCookies }; 
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  }
  userId = req.cookies.user_id;
  const user = users.userId;
  res.render("urls_new", {user});
});


app.post("/urls", (req, res) => {
  let short = generateRandomString();
  const userString = req.cookies.user_id;
  urlDatabase[short] = { longUrl: req.body.longURL, userID: userString };
  res.redirect(`/urls/${short}`);
});


app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect('/urls');
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const loggedInUserID = req.cookies.user_id;
  if (!loggedInUserID) {
    res.redirect("/login");
  }
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("Error 404");
  }
  if (urlDatabase[req.params.shortURL.userID] !== loggedInUserID) {
    res.status(404).send("Error 404");
  }
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
});





// Login

app.post("/login", (req, res) => {
  if (!doesUserEmailExist(req.body.email)) {
    return res.status(403).send("Email cannot be found");
  } else if (!isPasswordCorrect(req.body.email, req.body.password)) {
    return res.status(403).send("Email and password do not match");
  }   
  res.cookie("user_id", getIDByEmailPassword(req.body.email, req.body.password));
  res.redirect("/urls",);
});






app.get("/login", (req, res) => {
  const templateVars = {
    user: null
  };
  res.render("login", templateVars);
});


app.get("/register", (req, res) => {
  const templateVars = {
    user: null
  };
  res.render("register", templateVars);
});







//Register

app.post("/register", (req, res) => {



  // const password = "purple-monkey-dinosaur"; // found in the req.params object


  console.log("req.params: ", req.params);

  const salt = bcrypt.genSaltSync(10); // What is this?

  const plainTextPassword = req.body.password;

  const hashedPassword = bcrypt.hashSync(plainTextPassword, salt); // salt?
  // Error: data and salt arguments required
  // Hashed password is not a function 

  // const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);// Store hash in your password DB.



  let userID = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send("Email or password was blank");
  } else if (isEmailTaken(req.body.email)) {
      return res.status(400).send("Email is already taken");
  } else {
      users[userID] = { id: userID, email: req.body.email, password: hashedPassword};
      console.log(users);
      res.cookie("user_id", userID);
      res.redirect("/urls");
  }
});









app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/urls/:shortURL", (req, res) => {
  const loggedInUserID = req.cookies.user_id;
  if (!loggedInUserID) {
    return res.redirect("/login");
  }
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("Error 404");
  }
  if (urlDatabase[req.params.shortURL.userID] !== loggedInUserID) {
    return res.status(404).send("Error 404");
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
