document.getElementById('createForm').onsubmit = async (e) => {
    e.preventDefault();

    let title = $('#title').val();
    let username = $('#username').val().trim();
    let password = $('#password').val().trim();
    let notes = $('#notes').val();

    if (!title || !username || !password) {
        await renderAlert('Please enter the required fields', true);
        return
    }

    let formData = {
        title,
        username,
        password,
        notes
    };

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('x-auth-token', localStorage.token);

    await fetch(`/api/padlock/create`, {
        method: 'POST',
        headers: headers,
        mode: 'cors',
        body: JSON.stringify(formData)
    }).then((res) => res.json())
    .then((data) => {
        console.log(data);
    }).catch(async (err) => {
        await renderAlert(err.serverMsg, true);
    });
};