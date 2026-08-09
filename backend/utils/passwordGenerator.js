const crypto = require("crypto");

// Excludes visually-ambiguous characters (0/O, 1/I/L) since these codes get
// read aloud / typed by hand by team leaders.
const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateTeamPassword(length = 8) {
  let password = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += CHARSET[bytes[i] % CHARSET.length];
  }
  return password;
}

module.exports = { generateTeamPassword };
