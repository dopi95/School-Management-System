# Bluelight Academy School Management System - Full Stack

A comprehensive full-stack school management system built specifically for **Bluelight Academy**. This modern web application provides complete administrative control over students, employees, payments, and system management with advanced role-based access control.

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Secure Login System**: JWT-based authentication with refresh tokens
- **Role-Based Access Control**: Granular permissions for different admin roles
- **Superadmin Management**: Complete system control and admin creation
- **Profile Management**: Update personal information and change passwords

### 👨‍🎓 Student Management
- **Complete Student Records**: Add, edit, view, and manage student information
- **Student Status Control**: Mark students as active/inactive
- **Bulk Operations**: Update multiple students simultaneously
- **Advanced Search**: Search by name, ID, joined year, or class
- **Class Management**: Organize students by classes (KG-1, KG-2, KG-3)
- **Inactive Student Tracking**: Separate management for inactive students

### 👨‍🏫 Employee Management
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

### 📊 Dashboard & Analytics
- **Real-time Statistics**: Live counts of students, employees, and admins
- **Quick Actions**: Fast access to common tasks
- **Status Overview**: Visual representation of active/inactive records
- **Permission-based Display**: Show only accessible sections

### ⚙️ System Settings
- **Theme Control**: Dark/Light mode toggle
- **Language Support**: English and Amharic (አማርኛ) support
- **Notification Settings**: Configure system notifications
- **Security Settings**: Session timeout and login attempt controls
- **System Information**: Version and database status

### 🛡️ Advanced Security
- **Permission System**: 9 different permission levels
- **Route Protection**: API and frontend route security
- **Token Management**: Automatic token refresh and validation
- **Access Control**: Prevent unauthorized access with clear messaging

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks and context
- **React Router DOM**: Client-side routing with protected routes
- **Tailwind CSS**: Utility-first CSS framework with dark mode
- **Lucide React**: Beautiful and consistent icons
- **Context API**: State management for authentication and data
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Fast and minimal web framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT Authentication**: Secure token-based authentication
- **bcryptjs**: Password hashing and security
- **CORS**: Cross-origin resource sharing enabled
- **RESTful API**: Clean and organized API endpoints

### Security & Authentication
- **JWT Tokens**: Access and refresh token system
- **Password Hashing**: bcrypt with salt rounds
- **Role-based Permissions**: Granular access control
- **Route Protection**: Both API and frontend security
- **Environment Variables**: Secure configuration management

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

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@bluelight.com

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

6. **Start the backend server:**
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
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

## 📚 Usage Guide

### 🔑 Getting Started
1. **Login**: Use the default superadmin credentials to access the system
2. **Dashboard**: View system statistics and quick action buttons
3. **Navigation**: Use the sidebar to access different sections

### 👥 Admin Management (Superadmin Only)
1. **Create Admins**: Go to Admin Management and click "Add Admin"
2. **Set Permissions**: Select which sections each admin can access:
   - Dashboard (always enabled)
   - Students Management
   - Inactive Students
   - Employees Management
   - Inactive Employees
   - Payments Management
   - Admin Management
   - Settings
3. **Manage Roles**: Assign roles (admin, manager) with specific permissions
4. **Edit/Delete**: Update admin information or remove access

### 👨🎓 Student Management
1. **Adding Students**: Click "Add Student" and fill in the comprehensive form
2. **Viewing Students**: Click on student ID to view detailed information
3. **Editing Students**: Use the edit button in student details or table
4. **Managing Status**: Toggle between active/inactive status
5. **Bulk Operations**: Select multiple students for bulk status updates
6. **Search & Filter**: Find students by name, ID, joined year, or class
7. **Class Organization**: Organize students in KG-1, KG-2, KG-3 classes

### 👨🏫 Employee Management
1. **Add Employees**: Create records for teachers, assistants, and staff
2. **Role Assignment**: Set specific roles and responsibilities
3. **Class Assignment**: Assign teachers to specific classes
4. **Status Management**: Track active and inactive employees
5. **Contact Information**: Store phone numbers and addresses

### 💰 Payment Tracking
1. **Monthly Payments**: Track payments by month and academic year
2. **Payment Status**: Mark payments as paid/unpaid with timestamps
3. **Payment History**: View complete payment records with descriptions
4. **Bulk Updates**: Update multiple student payments at once
5. **Reports**: Generate payment reports for administrative use

### ⚙️ System Settings
1. **Theme**: Switch between light and dark modes
2. **Language**: Toggle between English and Amharic
3. **Notifications**: Configure system alerts and email notifications
4. **Security**: Set session timeout and login attempt limits
5. **Profile**: Update personal information and change passwords

## 📁 Project Structure

```
Bluelight-Academy-Management-System/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Database connection
│   │   ├── models/
│   │   │   ├── Admin.js              # Admin user model
│   │   │   ├── Student.js            # Student model
│   │   │   ├── Employee.js           # Employee model
│   │   │   └── Payment.js            # Payment model
│   │   ├── routes/
│   │   │   ├── auth.js               # Authentication routes
│   │   │   ├── students.js           # Student CRUD routes
│   │   │   ├── employees.js          # Employee CRUD routes
│   │   │   └── payments.js           # Payment routes
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT authentication
│   │   │   └── permissions.js        # Role-based permissions
│   │   ├── seedData.js               # Sample data seeding
│   │   └── seedAdmin.js              # Superadmin creation
│   ├── server.js                     # Express server setup
│   ├── package.json                  # Backend dependencies
│   └── .env                          # Environment variables
├── frontend/
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
│   │   │   ├── EmployeesContext.jsx  # Employee data management
│   │   │   ├── PaymentsContext.jsx   # Payment data management
│   │   │   ├── AdminsContext.jsx     # Admin data management
│   │   │   ├── ThemeContext.jsx      # Dark/Light theme
│   │   │   └── LanguageContext.jsx   # Multi-language support
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Login page
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── Students.jsx          # Student management
│   │   │   ├── Teachers.jsx          # Employee management
│   │   │   ├── AdminManagement.jsx   # Admin management
│   │   │   ├── Payments.jsx          # Payment tracking
│   │   │   ├── Profile.jsx           # User profile
│   │   │   ├── Settings.jsx          # System settings
│   │   │   └── AccessDenied.jsx      # Access denied page
│   │   ├── services/
│   │   │   └── api.js                # API service layer
│   │   ├── App.jsx                   # Main app component
│   │   └── main.jsx                  # React entry point
│   ├── package.json                  # Frontend dependencies
│   ├── .env                          # Frontend environment
│   ├── tailwind.config.js            # Tailwind CSS config
│   └── vite.config.js                # Vite build config
├── README.md                         # Project documentation
└── .gitignore                        # Git ignore rules
```

## 🔐 Permission System

The system includes a comprehensive role-based access control:

### Available Permissions
- **Dashboard**: Access to main dashboard (always enabled)
- **Students Management**: Manage active students
- **Inactive Students**: Access to inactive student records
- **Employees Management**: Manage active employees
- **Inactive Employees**: Access to inactive employee records
- **Payments Management**: Handle payment tracking
- **Admin Management**: Create and manage other admins (superadmin only)
- **Settings**: Access to system configuration
- **Profile**: Personal profile management (always enabled)

### Role Hierarchy
1. **Superadmin**: Full access to all features and admin management
2. **Admin**: Customizable permissions based on assigned access
3. **Manager**: Customizable permissions with limited administrative access

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds for password security
- **Route Protection**: Both API and frontend route security
- **Permission Guards**: Component-level access control
- **Session Management**: Configurable session timeout
- **Access Logging**: Track admin login activities

## 🌍 Multi-language Support

- **English**: Full system support
- **Amharic (አማርኛ)**: Complete translation for Ethiopian users
- **RTL Support**: Right-to-left text support for Amharic
- **Dynamic Switching**: Change language without page reload

## 🎨 UI/UX Features

- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Loading States**: Smooth loading indicators throughout the app
- **Error Handling**: User-friendly error messages and fallbacks
- **Accessibility**: WCAG compliant with keyboard navigation support

## 📊 Reporting & Analytics

- **Dashboard Statistics**: Real-time counts and status overview
- **Payment Reports**: Generate reports for paid/unpaid students
- **Student Analytics**: Track enrollment and status changes
- **Employee Reports**: Staff management and assignment tracking

## 🔧 Development

### Available Scripts

**Backend:**
```bash
npm run dev          # Start development server
npm run seed         # Seed sample data
npm run seed-admin   # Create superadmin account
```

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Tailwind CSS**: Utility-first styling
- **Component Structure**: Organized and reusable components

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
