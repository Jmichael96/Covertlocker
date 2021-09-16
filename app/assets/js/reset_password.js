let userEmail;

window.addEventListener('load', async () => {
    url = new URL(window.location.href)
    userEmail = url.searchParams.get('user_email');
});

document.getElementById('formWrap').addEventListener('submit', async (e) => {
    e.preventDefault();
    let password = $('#password').val().trim();
    let confirmPassword = $('#confirmPassword').val().trim();

    if (password !== confirmPassword) {
        await renderAlert('Passwords do not match', true);
        return;
    }
    
    if (!userEmail) {
        await renderAlert('Incorrect format', true);
        return;
    }

    let formData = {
        password: password
    };

    await fetch(`/api/auth/reset_password/${userEmail}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(formData)
    }).then((res) => res.json())
    .then(async (data) => {
        if (data.status === 404) {
            await renderAlert(data.serverMsg, true);
            return;
        }
        await renderAlert(data.serverMsg, false);
        setTimeout(() => {
            window.location.href = '/'
        }, 2000);
    }).catch(async (err) => {
        await renderAlert(err.serverMsg, true);
        throw err;
    });
});