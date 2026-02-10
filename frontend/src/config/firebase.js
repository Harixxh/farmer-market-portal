// Firebase configuration for Phone Authentication
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Replace these with your Firebase project credentials
// Get these from: https://console.firebase.google.com/ -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyDvlS1S9jHpvJbv_rjaoq3YFPUw5dCpspM",
  authDomain: "farmer-market-portal.firebaseapp.com",
  projectId: "farmer-market-portal",
  storageBucket: "farmer-market-portal.firebasestorage.app",
  messagingSenderId: "916275348933",
  appId: "1:916275348933:web:8b0aa46abdab1b882637ac"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// For testing - allow localhost
auth.settings.appVerificationDisabledForTesting = false;

// Clear reCAPTCHA completely
export const clearRecaptcha = () => {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      // Ignore clear errors
    }
    window.recaptchaVerifier = null;
  }
  window.confirmationResult = null;
  
  // Remove all reCAPTCHA iframes and badges
  const recaptchaElements = document.querySelectorAll('.grecaptcha-badge, iframe[src*="recaptcha"]');
  recaptchaElements.forEach(el => el.remove());
  
  // Clear the container
  const container = document.getElementById('recaptcha-container');
  if (container) {
    container.innerHTML = '';
  }
};

// Set up invisible reCAPTCHA verifier
export const setupRecaptcha = (containerId) => {
  return new Promise((resolve, reject) => {
    try {
      // If reCAPTCHA already exists and is valid, return it
      if (window.recaptchaVerifier) {
        resolve(window.recaptchaVerifier);
        return;
      }
      
      // Clear the container element
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
      
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        'size': 'invisible',
        'callback': (response) => {
          console.log('reCAPTCHA verified successfully');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          clearRecaptcha();
        }
      });
      
      // Render and resolve
      window.recaptchaVerifier.render().then(() => {
        console.log('reCAPTCHA ready');
        resolve(window.recaptchaVerifier);
      }).catch((err) => {
        console.error('reCAPTCHA render error:', err);
        clearRecaptcha();
        reject(err);
      });
      
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      clearRecaptcha();
      reject(error);
    }
  });
};

// Send OTP to phone number
export const sendPhoneOTP = async (phoneNumber) => {
  try {
    // Ensure reCAPTCHA is ready
    if (!window.recaptchaVerifier) {
      console.error('reCAPTCHA not initialized');
      return { success: false, message: 'Please wait for verification to load and try again.' };
    }
    
    const appVerifier = window.recaptchaVerifier;
    
    // Phone number must be in E.164 format: +[country code][number]
    // Remove any spaces, dashes, or parentheses
    let cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const formattedPhone = cleanNumber.startsWith('+') ? cleanNumber : `+91${cleanNumber}`;
    
    console.log('Sending OTP to:', formattedPhone);
    
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    
    // Store confirmation result for verification
    window.confirmationResult = confirmationResult;
    
    console.log('OTP sent successfully!');
    return { success: true, message: 'OTP sent successfully!' };
  } catch (error) {
    console.error('Error sending OTP:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Reset reCAPTCHA on error
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.log('Error clearing reCAPTCHA:', e);
      }
      window.recaptchaVerifier = null;
    }
    
    let errorMessage = 'Failed to send OTP';
    
    if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Invalid phone number format. Please enter a valid 10-digit number.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many attempts. Please try again after some time.';
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'SMS quota exceeded. Please try again tomorrow.';
    } else if (error.code === 'auth/captcha-check-failed') {
      errorMessage = 'reCAPTCHA verification failed. Please refresh and try again.';
    } else if (error.code === 'auth/missing-phone-number') {
      errorMessage = 'Please enter a valid phone number.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Phone authentication is not enabled. Please contact support.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, message: errorMessage, error };
  }
};

// Verify the OTP
export const verifyPhoneOTP = async (otp) => {
  try {
    if (!window.confirmationResult) {
      return { success: false, message: 'No OTP request found. Please request OTP again.' };
    }
    
    const result = await window.confirmationResult.confirm(otp);
    const user = result.user;
    
    // Get the ID token for backend verification if needed
    const idToken = await user.getIdToken();
    
    return { 
      success: true, 
      message: 'Phone verified successfully!',
      user,
      idToken
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    
    let errorMessage = 'Invalid OTP';
    
    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'Invalid verification code. Please try again.';
    } else if (error.code === 'auth/code-expired') {
      errorMessage = 'OTP has expired. Please request a new one.';
    }
    
    return { success: false, message: errorMessage, error };
  }
};

export { auth };
