const DB_NAME = process.env.NODE_ENV === "test" ? "testcapstonedb" : "capstonedb"

module.exports = DB_NAME