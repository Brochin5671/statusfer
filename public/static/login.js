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
        $('.alert').alert('close');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-warning alert-dismissible fade show';
        errorDiv.role = 'alert';
        errorDiv.innerHTML = data.message+`
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>`;
        form.insertBefore(errorDiv, form.firstChild);
    }else{ // Redirect to home on success
        window.location = '/';
    }
}

// Listen for submit event
const form = document.getElementById('login');
form.addEventListener('submit',submitLogin);