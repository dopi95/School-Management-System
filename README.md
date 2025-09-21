# School Management System - Full Stack

A complete full-stack school management system with React frontend and Node.js/Express backend.

## Features

- **Student Management**: Add, edit, view, and manage student records
- **Dynamic Data**: All data is stored in MongoDB and synced in real-time
- **Student Status**: Mark students as active/inactive
- **Bulk Operations**: Update multiple students at once
- **Payment Tracking**: Track student payments by month
- **Search & Filter**: Search students by name, ID, or filter by class
- **Responsive Design**: Works on desktop and mobile devices

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