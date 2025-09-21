# Bluelight Academy Management System - Full Stack

A comprehensive full-stack school management system built specifically for **Bluelight Academy**. This modern web application provides complete administrative control over students, employees, payments, and system management with advanced role-based access control.

## 🏫 About Bluelight Academy

This system is designed and developed for Bluelight Academy to streamline their educational administration processes. It provides a centralized platform for managing all aspects of the academy's operations.

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

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Lucide React (icons)
- Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled
- RESTful API design

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your MongoDB connection:
```env
MONGODB_URI=mongodb://localhost:27017/school-management
PORT=5000
```

4. Seed the database with sample data:
```bash
npm run seed
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `PATCH /api/students/:id/status` - Update student status
- `PATCH /api/students/:id/payment` - Update student payment
- `PATCH /api/students/bulk/update` - Bulk update students
- `DELETE /api/students/:id` - Delete student

## Usage

1. **Adding Students**: Click "Add Student" button and fill in the form
2. **Viewing Students**: Click on student ID to view detailed information
3. **Editing Students**: Click the edit icon or use the edit button in student details
4. **Managing Status**: Use the status toggle to activate/deactivate students
5. **Bulk Operations**: Select multiple students and use bulk action buttons
6. **Search**: Use the search bar to find students by name, ID, or joined year
7. **Filter**: Use class filter to show students from specific classes

## Project Structure

```
School-Management-System/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── models/
│   │   │   └── Student.js
│   │   ├── routes/
│   │   │   └── students.js
│   │   └── seedData.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.