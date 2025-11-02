# E-commerce Application

A full-stack e-commerce application built with Node.js, Express, React, and MongoDB.

## Features

- Product catalog with search and filtering
- Shopping cart functionality
- Order management system
- RESTful API
- Responsive design
- Unit and integration tests

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- RESTful API architecture

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Modern CSS styling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Running Tests

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Docker Deployment

You can also run the application using Docker:

```bash
cd deployment
docker-compose up
```

## Project Structure

```
.
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── frontend/
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── App.js       # Main App component
│       └── index.js     # Entry point
├── tests/               # Test files
├── docs/                # Documentation
└── deployment/          # Docker configuration
```

## API Documentation

See [API.md](./API.md) for detailed API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC License

## Support

For support, please open an issue in the repository.
