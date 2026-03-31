const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const RatePlan = require('../modules/hotelRoom/models/RatePlan');

async function updatePolicies() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB. Updating policies...');
        
        // Update all rate plans where freeCancellationDaysPrior is 3 to 1
        const result = await RatePlan.updateMany(
            { 'cancellationPolicy.freeCancellationDaysPrior': 3 },
            { $set: { 'cancellationPolicy.freeCancellationDaysPrior': 1 } }
        );
        console.log(`Updated ${result.modifiedCount} RatePlan documents.`);
        
        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error('Update failed:', err);
        process.exit(1);
    }
}

updatePolicies();
