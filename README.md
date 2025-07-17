# Clinic Management System

## Overview
This is a web-based Clinic Management System designed to manage user roles such as doctors, receptionists, and patients. The system provides login, registration, and role-based access to different dashboards. It uses Firebase for authentication and Firestore as the database.

## Features
- User authentication with Firebase Authentication.
- Role-based access control (Doctor, Receptionist, Patient).
- Registration form with validation.
- Login form with role-based redirects.
- Receptionist dashboard for patient entry.
- Logout functionality with redirect to the main page.
- Responsive and user-friendly UI with CSS styling.

## Technologies Used
- HTML5, CSS3, JavaScript
- Firebase Authentication and Firestore (using Firebase compat SDK)
- Firebase SDK loaded via CDN
- No backend server required; uses Firebase as backend.

## Project Structure
- `index.html`: Main login and registration page.
- `doctor.html`: Doctor dashboard page.
- `receptionist.html`: Receptionist dashboard page.
- `patient.html`: Patient dashboard page.
- `app.js`: JavaScript file handling authentication, form submissions, and role-based redirects.
- `firebase-config.js`: Firebase configuration and initialization.
- `styles.css`: Main stylesheet for the project.
- `package.json`: Project metadata and dependencies.

## Setup and Running
1. Clone or download the project files.
2. Open the project folder in VSCode or your preferred editor.
3. Serve the project using a local web server to avoid CORS issues. You can use:
   - VSCode Live Server extension
   - Python SimpleHTTPServer: `python -m http.server 5500`
   - Any other local server serving the project directory.
4. Open the browser and navigate to the local server URL, e.g., `http://127.0.0.1:5500/index.html`.
5. Use the login or registration forms to access the system.

## Notes
- Ensure Firebase project credentials are correctly set in `firebase-config.js`.
- The registration form defaults new users to the "receptionist" role.
- Role-based redirects ensure users access only their respective dashboards.
- Logout button signs out the user and redirects to the main login page.

## Troubleshooting
- If you encounter CORS errors, make sure you are serving the project via a local web server, not opening files directly.
- Check browser console for any errors related to Firebase or script loading.
- Verify Firebase configuration and internet connectivity.

## License
This project is open source and free to use.