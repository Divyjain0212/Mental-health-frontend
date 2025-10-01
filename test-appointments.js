// Test script to debug appointments endpoint
const API_BASE = 'https://mental-health-backend-7y7taaanr-divyjain0212s-projects.vercel.app';

async function testAppointments() {
  try {
    // Step 1: Login to get token
    console.log('Step 1: Logging in...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@student.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('Login failed:', loginResponse.status, await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful, token:', loginData.token ? 'present' : 'missing');
    
    // Step 2: Fetch appointments
    console.log('Step 2: Fetching appointments...');
    const appointmentsResponse = await fetch(`${API_BASE}/api/appointments/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!appointmentsResponse.ok) {
      console.log('Appointments failed:', appointmentsResponse.status, await appointmentsResponse.text());
      return;
    }
    
    const appointments = await appointmentsResponse.json();
    console.log('Appointments:', appointments);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAppointments();