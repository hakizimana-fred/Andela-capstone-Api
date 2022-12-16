const User = require("../models/User");
const assert = require("assert");

describe("Inserting User in Database", () => {
  it("creates a new User", async () => {
    const newUser = new User({
      name: "tester",
      email: "tester@gmail.com",
      password: "12345",
    });
    const saved = await newUser.save();
    if (saved) {
      assert(!newUser.isNew);
    }
  });
});
