const bcrypt = require('bcrypt');

// hash the pswd
async function hashPassword(plainPassword) {
    const saltRounds = 10;
    return await bcrypt.hash(plainPassword, saltRounds);
}

// compare pswd w/ hash's
async function comparePassword(plainPassword, hash) {
    return await bcrypt.compare(plainPassword, hash);
}

module.exports = { hashPassword, comparePassword };
