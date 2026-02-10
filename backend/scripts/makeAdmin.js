const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://harishmkr88:Harish2005@mern.ok8e5m8.mongodb.net/farmer-market';

// User Schema (matching your User model)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['farmer', 'buyer', 'admin'],
    default: 'farmer'
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function makeAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'harishmkr88@gmail.com';
    const adminPassword = 'Harish2005@';

    // Check if user exists
    let user = await User.findOne({ email: adminEmail });

    if (user) {
      // Update existing user to admin and reset password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      user.role = 'admin';
      user.password = hashedPassword;
      await user.save();
      console.log(`User ${adminEmail} has been updated to admin role with new password!`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      user = await User.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`New admin user created with email: ${adminEmail}`);
    }

    console.log('Admin setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

makeAdmin();
