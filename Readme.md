# Thesis Application

This project is a full-stack thesis management application built with React on the frontend and Node.js/Express on the backend. The application allows students to view assigned theses and feedback through a streamlined interface.

## Prerequisites

- [Node.js](https://nodejs.org/) installed latest version 21
- [npm](https://www.npmjs.com/) for package management

## Installation

To install the dependencies for both the frontend and backend, follow these steps:

1. Navigate to the backend directory and install dependencies:
    ```bash
    cd backend
    npm install
    cp env.sample .env
    ```

2. Navigate back to the root directory and then to the frontend directory:
    ```bash
    cd ..
    cd frontend
    npm install
    ```

3. Return to the root directory and install root-level dependencies:
    ```bash
    cd ..
    npm install
    ```
The application uses the `concurrently` package to run both the backend and frontend servers simultaneously.

## Running the Application

To start the development servers for both the backend and frontend, run:

```bash
npm start
```

This command will start both servers concurrently. You can access the application at the following URLs:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5174](http://localhost:5174)

## Project Structure

- **backend/** - Contains all backend code, including API endpoints and data management.
- **frontend/** - Contains all frontend code, built with React and Vite for a smooth UI experience.

## Features

- Students can view assigned theses.
- Feedback for theses is available on the student dashboard.

## License

This project is licensed under the MIT License.
