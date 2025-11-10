import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateGranularPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const admins = await Admin.find({});
    console.log(`Found ${admins.length} admins to migrate`);

    for (const admin of admins) {
      let updated = false;
      const newPermissions = { ...admin.permissions };

      // Define modules that need granular permissions
      const granularModules = [
        'students', 'inactiveStudents', 'employees', 'inactiveEmployees', 
        'payments', 'specialStudents', 'specialPayments', 'customPaymentLists', 'admins'
      ];

      // Special case for pendingStudents with approve action
      const pendingStudentsModule = 'pendingStudents';

      // Convert boolean permissions to granular object permissions
      granularModules.forEach(module => {
        if (typeof admin.permissions[module] === 'boolean') {
          if (admin.permissions[module] === true) {
            newPermissions[module] = {
              view: true,
              create: true,
              edit: true,
              delete: true
            };
            updated = true;
          } else {
            newPermissions[module] = {
              view: false,
              create: false,
              edit: false,
              delete: false
            };
            updated = true;
          }
        }
      });

      // Handle pendingStudents with approve action
      if (typeof admin.permissions[pendingStudentsModule] === 'boolean') {
        if (admin.permissions[pendingStudentsModule] === true) {
          newPermissions[pendingStudentsModule] = {
            view: true,
            create: true,
            edit: true,
            delete: true,
            approve: true
          };
          updated = true;
        } else {
          newPermissions[pendingStudentsModule] = {
            view: false,
            create: false,
            edit: false,
            delete: false,
            approve: false
          };
          updated = true;
        }
      } else if (admin.permissions[pendingStudentsModule] && !admin.permissions[pendingStudentsModule].hasOwnProperty('approve')) {
        // Add approve action to existing object permissions
        newPermissions[pendingStudentsModule] = {
          ...admin.permissions[pendingStudentsModule],
          approve: admin.permissions[pendingStudentsModule].view || false
        };
        updated = true;
      }

      if (updated) {
        await Admin.findByIdAndUpdate(admin._id, { permissions: newPermissions });
        console.log(`Updated permissions for admin: ${admin.name} (${admin.email})`);
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateGranularPermissions();