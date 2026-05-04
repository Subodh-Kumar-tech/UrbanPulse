require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const email = 'admin123@gmail.com';
    const password = 'admin@123';
    
    // Check if user exists
    let admin = await User.findOne({ email });
    
    if (admin) {
      console.log('Admin already exists. Updating password and role...');
      admin.password = password;
      admin.role = 'admin';
      await admin.save();
    } else {
      console.log('Creating new admin user...');
      admin = new User({
        name: 'System Admin',
        email: email,
        password: password,
        role: 'admin'
      });
      await admin.save();
    }
    
    console.log(`Admin user successfully configured!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
