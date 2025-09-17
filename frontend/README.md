# Bluelight Academy - School Management System Frontend

A modern, responsive school management system built with React, Vite, and Tailwind CSS.

## Features

### Authentication
- Login page with email/password
- Forgot password with email verification
- Remember me functionality
- Protected routes

### Dashboard
- Statistics cards (Students, Teachers, Admins)
- Recent activity overview
- Quick action buttons

### Student Management
- View all students in table format
- Search by name, ID, or phone number
- Filter by class (KG-1, KG-2, KG-3)
- Add new students with detailed form
- View individual student details
- Click ID number or eye icon to view details

### Teacher Management
- View all teachers with subjects
- Search functionality
- Add new teachers
- View teacher details

### Admin Management
- Role-based admin system (Super Admin, Admin, Student Admin)
- Add new admins with specific permissions
- Role-based access control

### Multi-language Support
- English and Amharic language toggle
- Flag icons for language selection
- Complete translation system

### Profile Management
- Update profile information
- Change password functionality
- User settings

## Technology Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Lucide React** - Icon library
- **Context API** - State management

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd School-Management-System/frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.js       # Main layout wrapper
│   └── Sidebar.js      # Navigation sidebar
├── context/            # React Context providers
│   ├── AuthContext.js  # Authentication state
│   └── LanguageContext.js # Language switching
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   ├── ForgotPassword.jsx
│   ├── Dashboard.jsx   # Main dashboard
│   ├── Students.jsx    # Student list
│   ├── StudentDetail.jsx
│   ├── AddStudent.jsx  # Add student form
│   ├── Teachers.jsx    # Teacher list
│   ├── Admins.jsx      # Admin list
│   ├── AddAdmin.jsx    # Add admin form
│   └── Profile.jsx     # User profile
├── App.jsx             # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## Features Overview

### Responsive Design
- Mobile-first approach
- Responsive tables and forms
- Adaptive sidebar navigation

### User Experience
- Smooth transitions and hover effects
- Loading states
- Form validation
- Search and filter functionality

### Security
- Protected routes
- Role-based access control
- Secure authentication flow

## Default Login Credentials

For testing purposes, you can use any email/password combination as the system uses mock authentication.

## Language Support

The system supports:
- **English (EN)** - Default language
- **Amharic (AM)** - Ethiopian language

Toggle between languages using the flag button in the sidebar.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.