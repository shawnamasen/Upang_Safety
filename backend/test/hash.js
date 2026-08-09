const bcrypt = require("bcryptjs");

(async () => {
  // put the password you want to hash
  const password = "password123";
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log("Hashed password:", hash);
})();