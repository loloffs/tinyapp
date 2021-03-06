const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require('cookie-session');
const { generateRandomString, isEmailTaken, getUserByEmail } = require("./helperFunctions");



app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["8327gd2d"]
}));


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
};


app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});


app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }

  const userFromCookies = users[req.session.user_id];
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
  if (!req.session.user_id) {
    res.redirect("/login");
  }

  userId = req.session.user_id;
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});


app.post("/urls", (req, res) => {
  let short = generateRandomString();
  const userString = req.session.user_id;
  urlDatabase[short] = { longURL: req.body.longURL, userID: userString };
  res.redirect(`/urls/${short}`);
});


// Delete button

app.post("/urls/:shortURL/delete", (req, res) => {
  const loggedInUserID = req.session.user_id;
  if (!loggedInUserID) {
    res.redirect("/login");
  }

  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("Error 404");
  }

  if (urlDatabase[req.params.shortURL].userID !== loggedInUserID) {
    res.status(404).send("Error 404");
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// Edit button

app.post("/urls/:id", (req, res) => {
  const loggedInUserID = req.session.user_id;
  
  if (!loggedInUserID) {
    res.redirect("/login");
  }

  if (!urlDatabase[req.params.id]) {
    res.status(404).send("Error 404");
  }

  if (urlDatabase[req.params.id].userID !== loggedInUserID) {
    res.status(404).send("Error 404");
  }

  urlDatabase[req.params.id].longURL = req.body.newURL;
  return res.redirect('/urls');
});



// Login button

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(403).send("Email or password cannot be blank");
  }

  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send("User not found");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password");
  }

  req.session.user_id = user.id;
  res.redirect("/urls",);
});



// Login page

app.get("/login", (req, res) => {
  const templateVars = {
    user: null
  };
  res.render("login", templateVars);
});



// Sign up page

app.get("/register", (req, res) => {
  const templateVars = {
    user: null
  };
  res.render("register", templateVars);
});



// Create account post request 

app.post("/register", (req, res) => {
  const salt = bcrypt.genSaltSync(10);
  const plainTextPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(plainTextPassword, salt);
  const userID = generateRandomString();
  
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send("Email or password was blank");
  }
  
  if (isEmailTaken(req.body.email, users)) {
    return res.status(400).send("Email is already taken");
  }

  users[userID] = { id: userID, email: req.body.email, password: hashedPassword};
  req.session.user_id = userID;
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {

  const loggedInUserID = req.session.user_id;
  if (!loggedInUserID) {
    return res.redirect("/login");
  }

  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("Error 404");
  }

  if (urlDatabase[req.params.shortURL].userID !== loggedInUserID) {
    return res.status(404).send("Error 404");
  }

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[loggedInUserID]};
  res.render("urls_show", templateVars);
});




// if user goes to http://localhost:8080/, redirect to register page

app.get("/", (req, res) => {

  res.redirect("/register");
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



// "Catch all" that redirects to login page

app.get("*", (req, res) => {
  res.redirect("/login");
});
