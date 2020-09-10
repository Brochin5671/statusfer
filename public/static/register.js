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
            'username': document.getElementById('username').value,
            'email': document.getElementById('email').value,
            'password': document.getElementById('password').value,
        })
    };
    const res = await fetch('/user/register',options);
    const data = await res.json();
    // Display error tip if failed
    if(data.error){
        const log = document.getElementById('log');
        log.className = 'small m-0 mt-2';
        log.innerText = data.message;
    }else{ // Redirect to home on success
        window.location = '/';
    }
}

// Listen for submit event
const form = document.getElementById('register');
form.addEventListener('submit',submitRegister);