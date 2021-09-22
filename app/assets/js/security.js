let id, email;

window.addEventListener('load', () => {
    url = new URL(window.location.href)
    email = url.searchParams.get('user_email');
    id = url.searchParams.get('id');
});

document.getElementById('securityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    let answer = $('#answer').val();
    let question = $('#question').val();

    let formData = {
        security: {
            answer,
            question
        }
    };

    await fetch(`/api/auth/change_security/${email}/${id}`, {
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