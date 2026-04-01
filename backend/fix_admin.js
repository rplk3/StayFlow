require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/modules/auth/models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to DB. Fixing admin user...');
    await User.deleteMany({ email: 'adminportal@gmail.com' });
    
    await User.create({
        firstName: 'Admin',
        lastName: 'Portal',
        email: 'adminportal@gmail.com',
        password: 'Admin@123',
        role: 'admin'
    });
    
    console.log('Successfully recreated adminportal@gmail.com with password Admin@123');
    process.exit(0);
}).catch(err => {
    console.error('Failed to connect:', err);
    process.exit(1);
});
