# Granular Permission System

## Overview
The system now supports granular action-level permissions for better access control. Instead of simple boolean permissions, admins can now have specific permissions for different actions within each module.

## Permission Structure

### Action Types
- **view**: Can see/read data in the module
- **create**: Can add new records
- **edit**: Can modify existing records  
- **delete**: Can remove records

### Modules with Granular Permissions
- Students Management
- Inactive Students
- Employees Management
- Inactive Employees
- Payments Management
- SP Students
- SP Payments

### Simple Boolean Permissions (unchanged)
- Dashboard
- Notifications
- Admin Management
- Settings
- Profile

## How It Works

### 1. Admin Creation
When creating a new admin, you can now select specific actions for each module:

```
Students Management:
☑ View    ☑ Create    ☐ Edit    ☐ Delete

Employees Management:
☑ View    ☐ Create    ☐ Edit    ☐ Delete
```

### 2. Permission Checking
The system automatically checks permissions based on the action being performed:

- **GET requests** → requires `view` permission
- **POST requests** → requires `create` permission  
- **PUT/PATCH requests** → requires `edit` permission
- **DELETE requests** → requires `delete` permission

### 3. UI Elements
Action buttons are automatically hidden/shown based on permissions:

- Add Student button → requires `create` permission
- Edit button → requires `edit` permission
- Delete button → requires `delete` permission
- Bulk actions → require `edit` permission

## Examples

### View-Only Access
An admin with only `view` permission for Students can:
- ✅ See the Students page in sidebar
- ✅ View student list and details
- ❌ Cannot see Add Student button
- ❌ Cannot see Edit/Delete buttons
- ❌ Cannot perform bulk actions

### Full Access
An admin with all permissions for Students can:
- ✅ View student data
- ✅ Add new students
- ✅ Edit existing students
- ✅ Delete students
- ✅ Perform bulk operations

### Mixed Permissions
An admin with `view` and `create` permissions can:
- ✅ View student data
- ✅ Add new students
- ❌ Cannot edit existing students
- ❌ Cannot delete students

## Migration
Existing admin accounts have been automatically migrated:
- Admins who had access to a module now have full permissions (view, create, edit, delete)
- Admins who didn't have access still have no permissions
- SuperAdmins continue to have full access to everything

## Usage in Code

### Frontend Permission Checking
```javascript
import { canView, canCreate, canEdit, canDelete } from '../utils/permissions.js';

// Check if user can perform specific actions
if (canCreate(admin, 'students')) {
  // Show Add Student button
}

if (canEdit(admin, 'students')) {
  // Show Edit button
}
```

### Backend Permission Middleware
```javascript
// Automatically checks permissions based on HTTP method
router.get('/students', checkPermission('students'), getStudents);
router.post('/students', checkPermission('students'), createStudent);
router.put('/students/:id', checkPermission('students'), updateStudent);
router.delete('/students/:id', checkPermission('students'), deleteStudent);
```

## Benefits
1. **Fine-grained Control**: Assign specific actions instead of all-or-nothing access
2. **Better Security**: Limit what users can do even within modules they can access
3. **Flexible Roles**: Create custom roles with specific permission combinations
4. **Audit Trail**: Clear understanding of what each admin can and cannot do
5. **Scalability**: Easy to add new actions or modules in the future