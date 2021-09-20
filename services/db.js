const mongoose = require('mongoose');
const productionDB = process.env.MONGODB_URI_PROD;
const developmentDB = process.env.MONGODB_URI_DEV;

const connectDB = async () => {
    try {
        await mongoose.connect(productionDB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });  
        console.log('Database has been penetrated!');
    } catch (err) {
        console.error(err.message);
        console.log('DB Error');
        process.exit(1);
    }
};

module.exports = connectDB;