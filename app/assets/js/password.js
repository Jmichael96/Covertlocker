let id, email;

window.addEventListener('load', () => {
    url = new URL(window.location.href)
    email = url.searchParams.get('user_email');
    id = url.searchParams.get('id');
});

document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    let password = $('#password').val().trim();
    let confirmPassword = $('#confirmPassword').val().trim();

    if (!password) {
        await renderAlert('Please enter your new password', true);
        return;
    }
    if (password !== confirmPassword) {
        await renderAlert('Your passwords do not match', true);
        return;
    }

    let formData = {
        password
    };

    await fetch(`/api/auth/change_password/${email}/${id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(formData)
    }).then((res) => res.json())
    .then(async (data) => {
        if (data.status === 404 || data.status === 401) {
            await renderAlert(data.serverMsg, true);
            return;
        }
        await renderAlert(data.serverMsg, false);
    }).catch(async (err) => {
        await renderAlert(err.serverMsg, true);
        throw err;
    });
});