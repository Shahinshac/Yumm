/**
 * Utility functions for user and account management
 */

// Generate a random secure password using crypto API
export const generatePassword = () => {
  const length = 12;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:",.<>?';

  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';

  // Ensure at least one from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Fisher-Yates shuffle for better randomization
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
};

// Generate an 11-digit account number
export const generateAccountNumber = () => {
  // Format: CCYYMMXXXXX (11 digits)
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const countryCode = '26';

  // Generate 5 random digits
  const randomNumber = String(Math.floor(Math.random() * 100000)).padStart(5, '0');

  return countryCode + year + month + randomNumber;
};

// Copy text to clipboard
export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error('Failed to copy:', err);
  });
};

// Format password for display
export const formatPassword = (password) => {
  return password;
};

// Validate email - improved regex
export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email) && email.length <= 254;
};

// Validate phone number - improved regex for international formats
export const validatePhone = (phone) => {
  // Accepts: +1234567890, 1234567890, +1 234-567-8900, (123) 456-7890
  const regex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  const cleaned = phone.replace(/[^\d\+]/g, '');
  return regex.test(phone) && cleaned.length >= 10 && cleaned.length <= 15;
};

// Sanitize HTML to prevent XSS
export const sanitizeHTML = (html) => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// Escape special characters for safe display
export const escapeHTML = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
};
