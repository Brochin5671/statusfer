// Creates and inserts error div
export function createErrorTip(adjElement, message){
    $('.alert').alert('close');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-warning alert-dismissible fade show';
    errorDiv.role = 'alert';
    errorDiv.innerHTML = `${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`;
    adjElement.insertAdjacentElement('beforeBegin', errorDiv);
}