document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    let password = $('#password').val().trim();
    let confirmPassword = $('#confirmPassword').val().trim();

    if (password !== confirmPassword) {
        await renderAlert('Your passwords do not match', true);
        return;
    }

    let formData = {
        password
    };

    await fetch(`/api/auth/change_password/${foundUser._id}`, {
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
        setTimeout(() => { window.location.href = '/account' }, 2000)
    }).catch(async (err) => {
        await renderAlert(err.serverMsg, true);
        throw err;
    });
});