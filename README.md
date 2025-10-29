# Bluelight Academy School Management System 

A comprehensive full-stack school management system built specifically for **Bluelight Academy**. This modern web application provides complete administrative control over students, employees, payments, and system management with advanced role-based access control.

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Secure Login System**: JWT-based authentication with refresh tokens
- **Role-Based Access Control**: Granular permissions for different admin roles
- **Superadmin Management**: Complete system control and admin creation
- **Profile Management**: Update personal information and change passwords
- **Password Reset**: Secure password reset via email

### 👨🎓 Student Management
- **Complete Student Records**: Add, edit, view, and manage student information
- **Student Status Control**: Mark students as active/inactive
- **Bulk Operations**: Update multiple students simultaneously
- **Advanced Search**: Search by name, ID, joined year, or class
- **Class Management**: Organize students by classes (KG-1, KG-2, KG-3) with sections
- **Inactive Student Tracking**: Separate management for inactive students
- **Student Registration**: Public registration form for new students
- **Pending Students**: Review and approve student registrations

### 🌟 Special Students Management
- **Special Student Records**: Dedicated management for special needs students
- **SP Student Tracking**: Separate payment and record system
- **Special Payments**: Independent payment tracking for special students
- **Approval System**: Convert pending students to special students

### 👨🏫 Employee Management
- **Staff Records**: Manage teachers, assistants, and other staff
- **Role Assignment**: Assign specific roles and responsibilities
- **Class Assignment**: Assign teachers to specific classes
- **Employee Status**: Track active and inactive employees
- **Comprehensive Profiles**: Store contact information and employment details

### 💰 Payment Management
- **Monthly Payment Tracking**: Track student payments by month and year
- **Payment History**: Complete payment records with descriptions
- **Payment Status**: Mark payments as paid/unpaid with timestamps
- **PDF Reports**: Generate payment reports for paid and unpaid students
- **Flexible Payment Periods**: Support for academic year payment cycles
- **Bulk Payment Processing**: Mark multiple students as paid simultaneously
- **Special Payment System**: Separate payment tracking for special students

### 📊 Dashboard & Analytics
- **Real-time Statistics**: Live counts of students, employees, and admins
- **Quick Actions**: Fast access to common tasks
- **Status Overview**: Visual representation of active/inactive records
- **Permission-based Display**: Show only accessible sections
- **Activity Monitoring**: Track system activities and changes

### 🔔 Notifications & Activity Logs
- **System Notifications**: Real-time notifications for important events
- **Activity Logging**: Comprehensive logging of all system activities
- **Admin Activity Tracking**: Monitor admin actions and changes
- **Email Notifications**: Automated email notifications for key events

### ⚙️ System Settings
- **Theme Control**: Dark/Light mode toggle
- **Language Support**: English and Amharic (አማርኛ) support
- **Notification Settings**: Configure system notifications
- **Security Settings**: Session timeout and login attempt controls
- **System Information**: Version and database status

### 🛡️ Advanced Security
- **Permission System**: Granular permission levels for different features
- **Route Protection**: API and frontend route security
- **Token Management**: Automatic token refresh and validation
- **Access Control**: Prevent unauthorized access with clear messaging
- **File Upload Security**: Secure profile image upload system

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks and context
- **React Router DOM**: Client-side routing with protected routes
- **Tailwind CSS**: Utility-first CSS framework with dark mode
- **Lucide React**: Beautiful and consistent icons
- **Context API**: State management for authentication and data
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Chart.js**: Interactive charts and data visualization
- **React Toastify**: Toast notifications for user feedback
- **jsPDF**: PDF generation for reports
- **XLSX**: Excel file export functionality

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Fast and minimal web framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT Authentication**: Secure token-based authentication
- **bcryptjs**: Password hashing and security
- **CORS**: Cross-origin resource sharing enabled
- **RESTful API**: Clean and organized API endpoints
- **Multer**: File upload handling for profile images
- **Nodemailer**: Email service integration

### Security & Authentication
- **JWT Tokens**: Access and refresh token system
- **Password Hashing**: bcrypt with salt rounds
- **Role-based Permissions**: Granular access control
- **Route Protection**: Both API and frontend security
- **Environment Variables**: Secure configuration management
- **File Upload Security**: Secure image upload with validation

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or cloud instance like MongoDB Atlas)
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### 💾 Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. **Create `.env` file with your configuration:**
```env
# Database Configuration
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/BLAIS?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_REFRESH_SECRET=your_refresh_token_secret_key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email Configuration (Brevo/Sendinblue)
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=noreply@bluelight.com
EMAIL_FROM_NAME=Bluelight Academy

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

4. **Seed the database with sample data:**
```bash
npm run seed
```

5. **Create the default superadmin account:**
```bash
npm run seed-admin
```

6. **Seed special students data (optional):**
```bash
npm run seed-special
```

7. **Run migrations if needed:**
```bash
npm run migrate-permissions
```

8. **Start the backend server:**
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 🎨 Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

4. **Start the development server:**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### 🔑 Default Login Credentials

After running the seed-admin command, use these credentials to log in:

- **Email**: `admin@bluelight.com`
- **Password**: `SuperAdmin123!`
- **Role**: Superadmin (full access to all features)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/profile` - Get current admin profile
- `PUT /api/auth/profile` - Update admin profile
- `GET /api/auth/admins` - Get all admins (superadmin only)
- `POST /api/auth/admins` - Create new admin (superadmin only)
- `PUT /api/auth/admins/:id` - Update admin (superadmin only)
- `DELETE /api/auth/admins/:id` - Delete admin (superadmin only)

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `PATCH /api/students/:id/status` - Update student status
- `PATCH /api/students/:id/payment` - Update student payment
- `PATCH /api/students/bulk/update` - Bulk update students
- `DELETE /api/students/:id` - Delete student

### Special Students
- `GET /api/special-students` - Get all special students
- `GET /api/special-students/:id` - Get special student by ID
- `POST /api/special-students` - Create new special student
- `PUT /api/special-students/:id` - Update special student
- `PATCH /api/special-students/:id/status` - Update special student status
- `PATCH /api/special-students/:id/payment` - Update special student payment
- `PATCH /api/special-students/bulk/update` - Bulk update special students
- `DELETE /api/special-students/:id` - Delete special student

### Pending Students
- `POST /api/pending-students/register` - Submit student registration (public)
- `GET /api/pending-students` - Get all pending students
- `POST /api/pending-students/:id/approve` - Approve as regular student
- `POST /api/pending-students/:id/approve-special` - Approve as special student
- `DELETE /api/pending-students/:id/reject` - Reject registration

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `PATCH /api/employees/:id/status` - Update employee status
- `DELETE /api/employees/:id` - Delete employee

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/student/:id` - Get student payments
- `POST /api/payments` - Create payment record
- `POST /api/payments/bulk` - Bulk payment processing
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Special Payments
- `GET /api/special-payments` - Get all special payments
- `GET /api/special-payments/student/:id` - Get special student payments
- `POST /api/special-payments` - Create special payment record
- `POST /api/special-payments/bulk` - Bulk special payment processing
- `PUT /api/special-payments/:id` - Update special payment
- `DELETE /api/special-payments/:id` - Delete special payment

### Notifications
- `GET /api/notifications` - Get all notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

### Activity Logs
- `GET /api/activity-logs` - Get activity logs
- `GET /api/activity-logs/admin/:id` - Get admin activity logs

## 📚 Usage Guide

### 🔑 Getting Started
1. **Login**: Use the default superadmin credentials to access the system
2. **Dashboard**: View system statistics and quick action buttons
3. **Navigation**: Use the sidebar to access different sections

### 👥 Admin Management (Superadmin Only)
1. **Create Admins**: Go to Admin Management and click "Add Admin"
2. **Set Permissions**: Select which sections each admin can access
3. **Manage Roles**: Assign roles (admin, manager) with specific permissions
4. **Edit/Delete**: Update admin information or remove access

### 👨🎓 Student Management
1. **Adding Students**: Click "Add Student" and fill in the comprehensive form
2. **Viewing Students**: Click on student ID to view detailed information
3. **Editing Students**: Use the edit button in student details or table
4. **Managing Status**: Toggle between active/inactive status
5. **Bulk Operations**: Select multiple students for bulk status updates
6. **Search & Filter**: Find students by name, ID, joined year, or class

### 💰 Payment Tracking
1. **Monthly Payments**: Track payments by month and academic year
2. **Payment Status**: Mark payments as paid/unpaid with timestamps
3. **Payment History**: View complete payment records with descriptions
4. **Bulk Updates**: Update multiple student payments at once
5. **Reports**: Generate payment reports for administrative use

## 📁 Project Structure

```
School-Management-System/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Database connection
│   │   ├── models/
│   │   │   ├── Admin.js              # Admin user model
│   │   │   ├── Student.js            # Student model
│   │   │   ├── SpecialStudent.js     # Special student model
│   │   │   ├── PendingStudent.js     # Pending student model
│   │   │   ├── Employee.js           # Employee model
│   │   │   ├── Payment.js            # Payment model
│   │   │   ├── SpecialPayment.js     # Special payment model
│   │   │   ├── Notification.js       # Notification model
│   │   │   ├── ActivityLog.js        # Activity log model
│   │   │   └── AdminActivityLog.js   # Admin activity log model
│   │   ├── routes/
│   │   │   ├── auth.js               # Authentication routes
│   │   │   ├── students.js           # Student CRUD routes
│   │   │   ├── specialStudents.js    # Special student routes
│   │   │   ├── pendingStudents.js    # Pending student routes
│   │   │   ├── employees.js          # Employee CRUD routes
│   │   │   ├── payments.js           # Payment routes
│   │   │   ├── specialPayments.js    # Special payment routes
│   │   │   ├── notifications.js      # Notification routes
│   │   │   └── activityLogs.js       # Activity log routes
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT authentication
│   │   │   └── permissions.js        # Role-based permissions
│   │   ├── utils/
│   │   │   └── activityLogger.js     # Activity logging utility
│   │   ├── migrations/
│   │   │   └── addSpecialPermissions.js # Database migrations
│   │   ├── uploads/
│   │   │   └── profiles/             # Profile image uploads
│   │   ├── seedData.js               # Sample data seeding
│   │   ├── seedAdmin.js              # Superadmin creation
│   │   └── seedSpecialData.js        # Special students seeding
│   ├── server.js                     # Express server setup
│   ├── package.json                  # Backend dependencies
│   └── .env                          # Environment variables
├── frontend/
│   ├── public/
│   │   └── cool-s.mp3               # Audio assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx            # Main layout wrapper
│   │   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   │   ├── PermissionGuard.jsx   # Permission-based rendering
│   │   │   ├── ProtectedRoute.jsx    # Route protection
│   │   │   └── modals/               # Reusable modal components
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Authentication state
│   │   │   ├── StudentsContext.jsx   # Student data management
│   │   │   ├── SpecialStudentsContext.jsx # Special student management
│   │   │   ├── EmployeesContext.jsx  # Employee data management
│   │   │   ├── PaymentsContext.jsx   # Payment data management
│   │   │   ├── SpecialPaymentsContext.jsx # Special payment management
│   │   │   ├── AdminsContext.jsx     # Admin data management
│   │   │   ├── ThemeContext.jsx      # Dark/Light theme
│   │   │   └── LanguageContext.jsx   # Multi-language support
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── ForgotPassword.jsx    # Password reset request
│   │   │   ├── ResetPassword.jsx     # Password reset form
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── Students.jsx          # Student management
│   │   │   ├── SpecialStudents.jsx   # Special student management
│   │   │   ├── PendingStudents.jsx   # Pending student approval
│   │   │   ├── StudentRegistration.jsx # Public registration form
│   │   │   ├── InactiveStudents.jsx  # Inactive student management
│   │   │   ├── Teachers.jsx          # Employee management
│   │   │   ├── InactiveEmployees.jsx # Inactive employee management
│   │   │   ├── AdminManagement.jsx   # Admin management
│   │   │   ├── Payments.jsx          # Payment tracking
│   │   │   ├── SpecialPayments.jsx   # Special payment tracking
│   │   │   ├── Notifications.jsx     # Notification management
│   │   │   ├── ActivityLogs.jsx      # Activity log viewing
│   │   │   ├── Profile.jsx           # User profile
│   │   │   ├── Settings.jsx          # System settings
│   │   │   └── AccessDenied.jsx      # Access denied page
│   │   ├── services/
│   │   │   └── api.js                # API service layer
│   │   ├── hooks/
│   │   │   └── useNotifications.js   # Notification hooks
│   │   ├── utils/
│   │   │   └── dateUtils.js          # Date utility functions
│   │   ├── assets/
│   │   │   └── images/               # Static images
│   │   ├── App.jsx                   # Main app component
│   │   └── main.jsx                  # React entry point
│   ├── package.json                  # Frontend dependencies
│   ├── .env                          # Frontend environment
│   ├── tailwind.config.cjs           # Tailwind CSS config
│   ├── vite.config.js                # Vite build config
│   └── vercel.json                   # Vercel deployment config
├── README.md                         # Project documentation
└── .gitignore                        # Git ignore rules
```

## 🔐 Permission System

The system includes a comprehensive role-based access control:

### Available Permissions
- **Dashboard**: Access to main dashboard (always enabled)
- **Students Management**: Manage active students
- **Special Students**: Manage special needs students
- **Inactive Students**: Access to inactive student records
- **Pending Students**: Review and approve student registrations
- **Employees Management**: Manage active employees
- **Inactive Employees**: Access to inactive employee records
- **Payments Management**: Handle regular payment tracking
- **Special Payments**: Handle special student payments
- **Admin Management**: Create and manage other admins (superadmin only)
- **Notifications**: Manage system notifications
- **Activity Logs**: View system activity logs
- **Settings**: Access to system configuration
- **Profile**: Personal profile management (always enabled)

### Role Hierarchy
1. **Superadmin**: Full access to all features and admin management
2. **Admin**: Customizable permissions based on assigned access
3. **Manager**: Customizable permissions with limited administrative access

### Permission Levels
- **View**: Read-only access to data
- **Edit**: Ability to modify existing records
- **Create**: Ability to add new records
- **Delete**: Ability to remove records

## 🔧 Development

### Available Scripts

**Backend:**
```bash
npm run dev                        # Start development server
npm run start                      # Start production server
npm run seed                       # Seed sample data
npm run seed-admin                 # Create superadmin account
npm run seed-special               # Seed special students data
npm run migrate-sections           # Migrate student sections
npm run migrate-permissions        # Add special permissions
npm run migrate-granular-permissions # Update permission structure
```

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📞 Support

For support and questions about Bluelight Academy Management System:

- **Email**: support@bluelight.com
- **Documentation**: Refer to this README and inline code comments
- **Issues**: Create GitHub issues for bugs and feature requests

## 📜 License

This project is developed specifically for **Bluelight Academy** and is licensed under the ISC License.

---

**Built with ❤️ for Bluelight Academy**

*Empowering education through technology*
