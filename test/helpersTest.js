const { assert } = require('chai');
const { getUserByEmail } = require('../helperFunctions.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expected = {id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur"};
    assert.deepEqual(user, expected);
  });

  it('should return undefined if email is not in database', function() {
    const actual = getUserByEmail("fakeemail@example.com", testUsers)
    const expected = undefined;
    assert.deepEqual(actual, expected);
  });
});

