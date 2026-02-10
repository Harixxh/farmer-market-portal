const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = 'mongodb+srv://harishmkr88:Harish2005@mern.ok8e5m8.mongodb.net/farmer-market';

async function fixAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'harishmkr88@gmail.com';
    const adminPassword = 'Harish2005@';

    // Get raw user document
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ email: adminEmail });
    
    if (user) {
      console.log('Found user:', user.email);
      console.log('Current password hash:', user.password);
      console.log('Password hash length:', user.password ? user.password.length : 'null');
      
      // Generate new proper bcrypt hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      console.log('New password hash:', hashedPassword);
      
      // Update directly in MongoDB
      await usersCollection.updateOne(
        { email: adminEmail },
        { 
          $set: { 
            password: hashedPassword,
            role: 'admin'
          } 
        }
      );
      
      console.log('Admin password updated successfully!');
      
      // Verify the update
      const updatedUser = await usersCollection.findOne({ email: adminEmail });
      console.log('Updated password hash:', updatedUser.password);
      
      // Test the password
      const isValid = await bcrypt.compare(adminPassword, updatedUser.password);
      console.log('Password verification test:', isValid ? 'PASSED' : 'FAILED');
    } else {
      console.log('User not found, creating new admin...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      await usersCollection.insertOne({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Admin created successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAdmin();
