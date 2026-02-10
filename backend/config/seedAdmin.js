const bcrypt = require('bcrypt');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = 'harishmkr88@gmail.com';
    const adminPassword = 'Harish2005@';
    const adminName = 'Admin';

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Update to admin role and reset password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      existingAdmin.role = 'admin';
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      
      console.log('Admin user updated successfully');
    } else {
      // Create new admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });

      console.log('Admin user created successfully');
    }

    // Verify admin can login
    const admin = await User.findOne({ email: adminEmail });
    if (admin && admin.password) {
      const isValid = await bcrypt.compare(adminPassword, admin.password);
      console.log(`Admin login verification: ${isValid ? 'PASSED' : 'FAILED'}`);
      console.log(`Admin credentials: Email: ${adminEmail}, Role: ${admin.role}`);
    }

  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};

module.exports = seedAdmin;
