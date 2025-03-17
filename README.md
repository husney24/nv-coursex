# NV CourseX - Online Learning Platform

![Screenshot 2025-03-17 233732](https://github.com/user-attachments/assets/6348f6e4-3aee-4ba8-b780-7610f3d09278)
![Screenshot 2025-03-17 233748](https://github.com/user-attachments/assets/19b4b629-8b2a-493d-b583-7884788034aa)



A modern online learning platform built with React, Node.js, and MySQL.

## Features

- User authentication and authorization
- Course management system
- Instructor profiles and course creation
- Student enrollment and progress tracking
- Rating and review system
- Responsive design for all devices
- Admin dashboard for platform management

## Tech Stack

- **Frontend:**
  - React
  - Material-UI
  - SCSS
  - Axios

- **Backend:**
  - Node.js
  - Express
  - MySQL
  - JWT Authentication

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/husney24/nv-coursex.git
cd nv-coursex
```

2. Install dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
   - Create `.env` file in the backend directory
   - Create `.env` file in the frontend directory
   - Add necessary environment variables (see `.env.example` files)

4. Set up the database:
   - Create a MySQL database
   - Import the schema from `backend/database/schema.sql`
   - Update database configuration in backend `.env` file

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Set up environment variables for production
3. Configure your web server (Nginx/Apache)
4. Set up SSL certificates
5. Deploy to your hosting provider

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 

## Pushing to GitHub

1. Initialize the repository and make your first commit:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Set up the remote repository and push:
```bash
git branch -M master
git remote add origin https://github.com/husney24/nv-coursex.git
git push -u origin master
```
