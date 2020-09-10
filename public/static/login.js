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
            'email': document.getElementById('email').value,
            'password': document.getElementById('password').value,
        })
    };
    const res = await fetch('/user/login',options);
    const data = await res.json();
    // Display error tip if failed
    if(data.error){
        const log = document.getElementById('log');
        log.className = 'small m-0 mt-2';
        log.innerHTML = data.message;
    }else{ // Redirect to home on success
        window.location = '/';
    }
}

// Listen for submit event
const form = document.getElementById('login');
form.addEventListener('submit',submitLogin);