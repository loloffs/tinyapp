const getUserByEmail = (email, database) => {
  for (const id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
  return undefined;
};

const isEmailTaken = function(email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return true;
    }
  }
  return false;
};

const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

module.exports = { getUserByEmail, isEmailTaken, generateRandomString };
