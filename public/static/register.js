// Sends a post request with form data
async function submitRegister(event){
    event.preventDefault(); // Overrides refresh
    // Send post request
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
    // Log failure
    const data = await res.json();
    if(data.message){
        log.className = 'small m-0 mt-2';
        log.innerHTML = data.message;
    }else{ // Redirect to home on success
        log.className = 'd-none';
        //window.location = '/';
    }
}

// Listen for submit event
const form = document.getElementById('register');
const log = document.getElementById('log');
form.addEventListener('submit',submitRegister);