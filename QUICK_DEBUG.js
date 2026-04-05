// Quick diagnostic script - open browser console and paste this:

// Check what's in localStorage
console.log('=== AUTH STATE ===');
console.log('access_token:', localStorage.getItem('access_token') ? '✅ Present' : '❌ Missing');
console.log('refresh_token:', localStorage.getItem('refresh_token') ? '✅ Present' : '❌ Missing');

// Check Zustand auth store (if accessible)
import { useAuthStore } from './context/authStore';
const authState = useAuthStore.getState();
console.log('\n=== ZUSTAND AUTH STORE ===');
console.log('isAuthenticated:', authState.isAuthenticated);
console.log('user:', authState.user);
console.log('user.role:', authState.user?.role);

// Manual API test
const testLogin = async () => {
  const response = await fetch('API_BASE_URL/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'shahinsha',
      password: '262007'
    })
  });
  const data = await response.json();
  console.log('\n=== LOGIN API RESPONSE ===');
  console.log(JSON.stringify(data, null, 2));
};

testLogin();
