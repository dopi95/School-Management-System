import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const migratePermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const admins = await Admin.find({});
    
    for (const admin of admins) {
      const oldPermissions = admin.permissions;
      const newPermissions = {
        dashboard: oldPermissions.dashboard || true,
        profile: oldPermissions.profile || true,
        notifications: oldPermissions.notifications || false,
        admins: oldPermissions.admins || false,
        settings: oldPermissions.settings || false
      };

      // Convert module permissions to action-based structure
      const modules = ['students', 'inactiveStudents', 'employees', 'inactiveEmployees', 'payments', 'specialStudents', 'specialPayments'];
      
      modules.forEach(module => {
        if (oldPermissions[module]) {
          // If they had access, give them full permissions
          newPermissions[module] = {
            view: true,
            create: true,
            edit: true,
            delete: true
          };
        } else {
          // If they didn't have access, give them no permissions
          newPermissions[module] = {
            view: false,
            create: false,
            edit: false,
            delete: false
          };
        }
      });

      admin.permissions = newPermissions;
      await admin.save();
      console.log(`Updated permissions for admin: ${admin.name}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migratePermissions();