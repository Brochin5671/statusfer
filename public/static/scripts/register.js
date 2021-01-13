// Select reusable elements
const form = document.getElementById('registerForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Listen for submit event
form.addEventListener('submit', submitRegister);

// Sends a post request with register form data
async function submitRegister(event){
    // Prevent refresh
    event.preventDefault();
    // Send post request with form data and save response
    const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
            'username': usernameInput.value,
            'email': emailInput.value,
            'password': passwordInput.value,
            'confirmPassword': confirmPasswordInput.value,
        })
    };
    const res = await fetch('/user/register', options);
    const {error, message} = await res.json();
    // Redirect to home on success
    if(!error){
        window.location = '/';
    }else{ // Display error tip on failure
        $('.alert').alert('close');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-warning alert-dismissible fade show';
        errorDiv.role = 'alert';
        errorDiv.innerHTML = `${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>`;
        form.firstElementChild.insertAdjacentElement('beforeBegin', errorDiv);
    }
}