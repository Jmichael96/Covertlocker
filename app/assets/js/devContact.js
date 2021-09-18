setReadyListener();

// watches for the found user variable to change with user data
function setReadyListener() {
    const readyListener = async () => {
        if (foundUser) {
            document.getElementById('devContactRoot').style.display = 'block';
            removeLoader();
            return;
        }
        return setTimeout(readyListener, 250);
    };
    readyListener();
};

document.getElementById('devForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    let messageType = $('#messageType').val();
    let message = $('#message').val();

    if (!messageType || !message) {
        await renderAlert('Please fill out both fields', true);
        return;
    }
    let formData = {
        messageType: messageType,
        message: message
    };
    console.log(formData);
    await fetch(`/api/message/create`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData)
    }).then((res) => res.json())
    .then(async (data) => {
        resetForm();
        await renderAlert(data.serverMsg, false);
    }).catch(async (err) => {
        await renderAlert(err.serverMsg, true);
        throw err;
    });
});

const resetForm = () => {
    $('#messageType').val('');
    $('#message').val('');
};