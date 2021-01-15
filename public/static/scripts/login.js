// Import error tip
import {createErrorTip} from './misc.js';

// Select reusable elements
const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Listen for submit event
form.addEventListener('submit', submitLogin);

// Sends a post request with login form data
async function submitLogin(event){
    // Prevent refresh
    event.preventDefault();
    // Send post request with form data and save response
    const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
            'email': emailInput.value,
            'password': passwordInput.value,
        })
    };
    const res = await fetch('/user/login', options);
    const {error, message} = await res.json();
    // Redirect to home on success
    if(!error){
        window.location = '/';
    }else{ // Display error tip on failure
        createErrorTip(form.firstElementChild, message);
    }
}