// Get requested status and return it
async function getStatus(){
    // Get statusId from URL, send get request, and save response
    const statusId = window.location.href.split("/").pop();
    const res = await fetch('/status/'+statusId+'/data');
    const data = await res.json();
    // Display username and status on success
    if(!data.error){
        username.innerHTML = data.user;
        statusText.innerHTML = data.status;
    }else{ // Send error
        username.innerHTML = data.error;
        statusText.innerHTML = data.message;
    }
}

// Select username and status text
const username = document.querySelector('h5');
const statusText = document.querySelector('p');