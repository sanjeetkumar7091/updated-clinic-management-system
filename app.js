document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');

  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');

  const registerForm = document.getElementById('register-form');
  const registerError = document.getElementById('register-error');
  const registerSuccess = document.getElementById('register-success');
  const showRegisterLink = document.getElementById('show-register');

  // Elements for new features
  const patientEntryForm = document.getElementById('patient-entry-form');
  const entryMessage = document.getElementById('entry-message');
  const tokenDisplay = document.getElementById('token-display');
  const patientSelect = document.getElementById('patient-select');
  const billingForm = document.getElementById('billing-form');
  const billingMessage = document.getElementById('billing-message');
  const billDisplay = document.getElementById('bill-display');

  const prescriptionForm = document.getElementById('prescription-form');
  const prescriptionMessage = document.getElementById('prescription-message');
  const patientSelectPrescription = document.getElementById('patient-select-prescription');

  // Toggle between login and register forms
  if (showRegisterLink) {
    const showLoginLink = document.getElementById('show-login');
    const showRegisterWrapper = document.getElementById('show-register-wrapper');
    const showLoginWrapper = document.getElementById('show-login-wrapper');

    showRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      loginError.textContent = '';
      registerError.textContent = '';
      registerSuccess.textContent = '';
      showRegisterWrapper.style.display = 'none';
      showLoginWrapper.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      loginError.textContent = '';
      registerError.textContent = '';
      registerSuccess.textContent = '';
      showRegisterWrapper.style.display = 'block';
      showLoginWrapper.style.display = 'none';
    });
  }

  // Fetch and display assigned patients on doctor.html
  if (window.location.pathname.endsWith('doctor.html')) {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = 'index.html';
        return;
      }
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (!userDoc.exists) {
        await auth.signOut();
        window.location.href = 'index.html';
        return;
      }
      const userData = userDoc.data();
      if (userData.role !== 'doctor') {
        await auth.signOut();
        window.location.href = 'index.html';
        return;
      }
      // Query patients assigned to this doctor
      const patientsListDiv = document.getElementById('patients-list');
      if (!patientsListDiv) return;

      try {
        const patientsQuerySnapshot = await db.collection('patients')
          .where('assignedDoctorId', '==', user.uid)
          .get();

        if (patientsQuerySnapshot.empty) {
          patientsListDiv.innerHTML = '<p>No assigned patients found.</p>';
          return;
        }

        let html = '<ul>';
        patientsQuerySnapshot.forEach(doc => {
          const patient = doc.data();
          html += `<li><strong>${patient.name || 'Unnamed'}</strong> - Age: ${patient.age || 'N/A'}, Condition: ${patient.condition || 'N/A'}</li>`;
        });
        html += '</ul>';
        patientsListDiv.innerHTML = html;

        // Populate patient selects for prescription and billing
        if (patientSelect) {
          patientSelect.innerHTML = '<option value="">Select a patient</option>';
          patientsQuerySnapshot.forEach(doc => {
            const patient = doc.data();
            patientSelect.innerHTML += `<option value="${doc.id}">${patient.name || 'Unnamed'}</option>`;
          });
        }
        if (patientSelectPrescription) {
          patientSelectPrescription.innerHTML = '<option value="">Select a patient</option>';
          patientsQuerySnapshot.forEach(doc => {
            const patient = doc.data();
            patientSelectPrescription.innerHTML += `<option value="${doc.id}">${patient.name || 'Unnamed'}</option>`;
          });
        }
      } catch (error) {
        patientsListDiv.innerHTML = `<p>Error loading patients: ${error.message}</p>`;
      }
    });
  }

  // Populate assigned-doctor select in receptionist.html
  if (window.location.pathname.endsWith('receptionist.html')) {
    auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed in receptionist.html:', user);
      if (!user) {
        window.location.href = 'index.html';
        return;
      }
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
          console.log('User doc does not exist for user:', user.uid);
          await auth.signOut();
          window.location.href = 'index.html';
          return;
        }
        const userData = userDoc.data();
        console.log('User data in receptionist.html:', userData);
        if (userData.role !== 'receptionist') {
          console.log('User role is not receptionist:', userData.role);
          await auth.signOut();
          window.location.href = 'index.html';
          return;
        }
        const assignedDoctorSelect = document.getElementById('assigned-doctor');
        if (!assignedDoctorSelect) {
          console.log('assigned-doctor select element not found');
          return;
        }

        const doctorsQuerySnapshot = await db.collection('users')
          .where('role', '==', 'doctor')
          .get();

        console.log('Doctors query snapshot size:', doctorsQuerySnapshot.size);

        if (doctorsQuerySnapshot.empty) {
          assignedDoctorSelect.innerHTML = '<option value="">No doctors available</option>';
          return;
        }

        assignedDoctorSelect.innerHTML = '<option value="">Select a doctor</option>';
        doctorsQuerySnapshot.forEach(doc => {
          const doctor = doc.data();
          assignedDoctorSelect.innerHTML += `<option value="${doc.id}">${doctor.email || 'Unnamed Doctor'}</option>`;
        });
      } catch (error) {
        console.log('Error loading doctors:', error);
        assignedDoctorSelect.innerHTML = `<option value="">Error loading doctors: ${error.message}</option>`;
      }
    });
  }

  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.textContent = '';
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Get user role from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
          loginError.textContent = 'User role not found. Contact admin.';
          await auth.signOut();
          return;
        }
        const userData = userDoc.data();

        // Automatically redirect based on user role
        if (userData.role === 'doctor') {
          window.location.href = 'doctor.html';
        } else if (userData.role === 'receptionist') {
          window.location.href = 'receptionist.html';
        } else if (userData.role === 'patient') {
          window.location.href = 'patient.html';
        } else {
          loginError.textContent = 'Invalid user role.';
          await auth.signOut();
        }

      } catch (error) {
        loginError.textContent = error.message;
      }
    });
  }

  // Patient entry form submission with token generation
  if (patientEntryForm) {
    patientEntryForm.addEventListener('submit', async (e) => {
      console.log('Patient entry form submit event fired');
      e.preventDefault();
      entryMessage.textContent = '';
      tokenDisplay.textContent = 'Generating token...';

      const name = document.getElementById('name').value;
      const age = parseInt(document.getElementById('age').value);
      const gender = document.getElementById('gender').value;
      const contact = document.getElementById('contact').value;
      const symptoms = document.getElementById('symptoms').value;
      const assignedDoctorId = document.getElementById('assigned-doctor').value;

      try {
        // Generate a token (e.g., random 6-digit number)
        const token = Math.floor(100000 + Math.random() * 900000);
        console.log('Generated token:', token);

        // Save patient info with token and assignedDoctorId from form
        const patientRef = await db.collection('patients').add({
          name,
          age,
          gender,
          contact,
          symptoms,
          token,
          assignedDoctorId: assignedDoctorId || null,
          prescriptions: [],
          createdAt: new Date()
        });

        entryMessage.textContent = 'Patient added successfully!';
        tokenDisplay.textContent = `Token: ${token}`;

        // Reset form
        patientEntryForm.reset();

        // Update patient selects for billing and prescription
        if (patientSelect) {
          patientSelect.innerHTML += `<option value="${patientRef.id}">${name}</option>`;
        }
        if (patientSelectPrescription) {
          patientSelectPrescription.innerHTML += `<option value="${patientRef.id}">${name}</option>`;
        }
      } catch (error) {
        console.error('Error adding patient:', error);
        entryMessage.textContent = `Error adding patient: ${error.message}`;
        tokenDisplay.textContent = 'No token generated yet.';
      }
    });
  }

  // Billing form submission
  if (billingForm) {
    billingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      billingMessage.textContent = '';
      billDisplay.innerHTML = '';

      const patientId = patientSelect.value;
      const charges = parseFloat(document.getElementById('charges').value);

      if (!patientId) {
        billingMessage.textContent = 'Please select a patient.';
        return;
      }
      if (isNaN(charges) || charges < 0) {
        billingMessage.textContent = 'Please enter valid charges.';
        return;
      }

      try {
        // Save billing info in Firestore under patient's document
        const billingData = {
          charges,
          billedAt: new Date()
        };
        await db.collection('patients').doc(patientId).collection('billing').add(billingData);

        billingMessage.textContent = 'Bill generated successfully!';

        // Display bill details
        billDisplay.innerHTML = `<p>Patient ID: ${patientId}</p><p>Charges: $${charges.toFixed(2)}</p><p>Date: ${billingData.billedAt.toLocaleString()}</p>`;

        // Reset form
        billingForm.reset();
      } catch (error) {
        billingMessage.textContent = `Error generating bill: ${error.message}`;
      }
    });
  }

  // Prescription form submission
  if (prescriptionForm) {
    prescriptionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      prescriptionMessage.textContent = '';

      const patientId = patientSelectPrescription.value;
      const prescriptionText = document.getElementById('prescription-text').value;

      if (!patientId) {
        prescriptionMessage.textContent = 'Please select a patient.';
        return;
      }
      if (!prescriptionText.trim()) {
        prescriptionMessage.textContent = 'Please enter a prescription.';
        return;
      }

      try {
        // Add prescription to patient's prescriptions array in Firestore
        const patientRef = db.collection('patients').doc(patientId);
        await patientRef.update({
          prescriptions: firebase.firestore.FieldValue.arrayUnion({
            text: prescriptionText,
            prescribedAt: new Date()
          })
        });

        prescriptionMessage.textContent = 'Prescription submitted successfully!';

        // Reset form
        prescriptionForm.reset();
      } catch (error) {
        prescriptionMessage.textContent = `Error submitting prescription: ${error.message}`;
      }
    });
  }

  // Login as Doctor button submission
  const loginDoctorBtn = document.getElementById('login-doctor-btn');
  if (loginDoctorBtn) {
    console.log('loginDoctorBtn found, attaching event listener');
    loginDoctorBtn.addEventListener('click', async () => {
      console.log('loginDoctorBtn clicked');
      loginError.textContent = '';
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (!email || !password) {
        loginError.textContent = 'Please enter email and password.';
        return;
      }

      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Get user role from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
          loginError.textContent = 'User role not found. Contact admin.';
          await auth.signOut();
          return;
        }
        const userData = userDoc.data();

        // Check if user is doctor
        if (userData.role === 'doctor') {
          window.location.href = 'doctor.html';
        } else {
          loginError.textContent = 'You are not a doctor.';
          await auth.signOut();
        }
      } catch (error) {
        loginError.textContent = error.message;
      }
    });
  }

  // Login as Receptionist button submission
  const loginReceptionistBtn = document.getElementById('login-receptionist-btn');
  if (loginReceptionistBtn) {
    loginReceptionistBtn.addEventListener('click', async () => {
      loginError.textContent = '';
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (!email || !password) {
        loginError.textContent = 'Please enter email and password.';
        return;
      }

      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Get user role from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
          loginError.textContent = 'User role not found. Contact admin.';
          await auth.signOut();
          return;
        }
        const userData = userDoc.data();

        // Check if user is receptionist
        if (userData.role === 'receptionist') {
          window.location.href = 'receptionist.html';
        } else {
          loginError.textContent = 'You are not a receptionist.';
          await auth.signOut();
        }
      } catch (error) {
        loginError.textContent = error.message;
      }
    });
  }

  // Register form submission
  if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        console.log('Register form submit event fired');
        e.preventDefault();
        registerError.textContent = '';
        registerSuccess.textContent = '';

        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const role = document.getElementById('register-role').value;

        if (password !== confirmPassword) {
          registerError.textContent = 'Passwords do not match.';
          return;
        }

        if (!role) {
          registerError.textContent = 'Please select a role.';
          return;
        }

        try {
          const userCredential = await auth.createUserWithEmailAndPassword(email, password);
          const user = userCredential.user;

          // Save user role in Firestore
          await db.collection('users').doc(user.uid).set({
            role: role,
            email: email,
            createdAt: new Date()
          });

          registerSuccess.textContent = 'Registration successful! You can now log in.';

          // Normalize role value for comparison
          const normalizedRole = role.trim().toLowerCase();
          console.log('Register role:', normalizedRole);

          // Show pop-up alert for doctor or receptionist roles
          if (normalizedRole === 'doctor' || normalizedRole === 'receptionist') {
            console.log('Showing success alert for role:', normalizedRole);
            alert('Successfully registered');
          }

          registerForm.reset();

          // Switch back to login form
          registerForm.style.display = 'none';
          loginForm.style.display = 'block';
        } catch (error) {
          registerError.textContent = error.message;
        }
      });
  }

  // Logout button handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await auth.signOut();
      window.location.href = 'index.html'; // Redirect to main page after logout
    });
  }

  // Post-login page buttons
  const doctorPageBtn = document.getElementById('doctor-page-btn');
  const receptionistPageBtn = document.getElementById('receptionist-page-btn');
  const patientPageBtn = document.getElementById('patient-page-btn');

  if (doctorPageBtn) {
    doctorPageBtn.addEventListener('click', () => {
      if (window.loggedInUserRole === 'doctor') {
        window.location.href = 'doctor.html';
      } else {
        alert('Access denied: You are not a doctor.');
      }
    });
  }

  if (receptionistPageBtn) {
    receptionistPageBtn.addEventListener('click', () => {
      if (window.loggedInUserRole === 'receptionist') {
        window.location.href = 'receptionist.html';
      } else {
        alert('Access denied: You are not a receptionist.');
      }
    });
  }

  if (patientPageBtn) {
    patientPageBtn.addEventListener('click', () => {
      if (window.loggedInUserRole === 'patient') {
        window.location.href = 'patient.html';
      } else {
        alert('Access denied: You are not a patient.');
      }
    });
  }

  // On doctor.html, receptionist.html or patient.html, check auth state and redirect if not logged in
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      if (!window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
      }
      return;
    }
    // Optionally, verify role matches page
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      await auth.signOut();
      if (!window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
      }
      return;
    }
    const userData = userDoc.data();
    if (window.location.pathname.endsWith('doctor.html') && userData.role !== 'doctor') {
      await auth.signOut();
      if (!window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
      }
    }
    if (window.location.pathname.endsWith('receptionist.html') && userData.role !== 'receptionist') {
      await auth.signOut();
      if (!window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
      }
    }
    if (window.location.pathname.endsWith('patient.html') && userData.role !== 'patient') {
      await auth.signOut();
      if (!window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
      }
    }
  });
});
