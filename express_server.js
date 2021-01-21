const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");




app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());


const generateRandomString = function () {
  return Math.random().toString(36).substr(2, 6);
};



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    if (user[id].email === email) {
      return user.password === passwordAttempt;
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




app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]}; 
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let short = generateRandomString();
  urlDatabase[short] = req.body.longURL;
  res.redirect(`/urls/${short}`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  // Modify the POST /login endpoint so that it uses the new email 
  // and password fields, and sets an appropriate user_id cookie on 
  // successful login. We'll no longer use the username cookie.

  if (!doesUserEmailExist(req.body.email)) {
    return res.status(403).send("Email cannot be found");
  } else if (!isPasswordCorrect(req.body.email, req.body.password)) {
    return res.status(403).send("Email and password do not match");
  }
  
});

//here
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


app.post("/register", (req, res) => {
  let userID = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send("Email or password was blank");
  } else if (isEmailTaken(req.body.email)) {
      return res.status(400).send("Email is already taken");
  } else {
      users[userID] = { id: userID, email: req.body.email, password: req.body.password };
      res.cookie("user_id", userID);
      res.redirect("/urls");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]]};
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
