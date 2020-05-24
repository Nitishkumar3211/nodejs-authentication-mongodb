const dbConfig = require("../config/db.config.js");
const mongoose = require("mongoose");
const connectionString = dbConfig.url;
// mongoose.Promise = global.Promise;

// const db = {};
// db.mongoose = mongoose;
// db.url = dbConfig.url;
// db.user_master = require("./user_master.js")(mongoose);

// module.exports = db;

const InitiateMongoServer = async() => {
    try {
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to DB !!");
    } catch (e) {
        console.log(e);
        throw e;
    }
};

module.exports = InitiateMongoServer;