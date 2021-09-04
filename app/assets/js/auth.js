// switch form to register when button is clicked
document.getElementById('switchToRegisterBtn').onclick = () => {
    document.getElementById('loginWrap').style.display = 'none';
    document.getElementById('registerWrap').style.display = 'block';
};

// switch form to login when button is clicked
document.getElementById('switchToLoginBtn').onclick = () => {
    document.getElementById('registerWrap').style.display = 'none';
    document.getElementById('loginWrap').style.display = 'block';
};

document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();

    let email = $('#loginEmail').val().trim();
    let password = $('#loginPassword').val().trim();

    if (!email || !password) {
        await renderAlert('Please enter both your email and password', true);
        return;
    }

    let formData = {
        email,
        password
    };

    // let headers = new Headers();
    // headers.append('Content-Type', 'application/json');
    // headers.append('x-auth-token', localStorage.token);

    await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: headers,
        mode: 'cors',
        body: JSON.stringify(formData)
    }).then((res) => res.json())
        .then(async (data) => {
            localStorage.setItem('token', data.token);
            await renderAlert(data.serverMsg, false);
            setTimeout(() => {
                window.location.href = '/account';
            }, 2000);
        }).catch(async (err) => {
            await renderAlert(err.response.data.serverMsg, true);
        });
};

document.getElementById('registerForm').onsubmit = async (e) => {
    e.preventDefault();
    let name = $('#registerName').val();
    let email = $('#registerEmail').val();
    let password = $('#registerPassword').val().trim();
    let passwordCheck = $('#registerPasswordCheck').val().trim();
    let question = $('#registerQuestion').val();
    let answer = $('#registerAnswer').val();

    if (!name || !email || !password || !passwordCheck || !question || !answer) {
        await renderAlert('Please fill out each field', true);
        return;
    }
    if (password !== passwordCheck) {
        await renderAlert('Passwords do not match', true);
        return;
    }

    let formData = {
        name,
        email,
        password,
        question,
        answer
    };

    // let headers = new Headers();
    // headers.append('Content-Type', 'application/json');
    // headers.append('x-auth-token', localStorage.token);

    await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: headers,
        mode: 'cors',
        body: JSON.stringify(formData)
    }).then((res) => res.json())
        .then(async (data) => {
            localStorage.setItem('token', data.token);
            await renderAlert(data.serverMsg, false);
            setTimeout(() => {
                window.location.href = '/account';
            }, 2000);
        }).catch(async (err) => {
            await renderAlert(err.response.data.serverMsg, true);
        });
};

// const renderAlert = async (msg, isErr) => {
//     const alert = document.getElementById('formAlert');
//     const iconWrap = document.getElementById('alertIconWrap');
//     // message section to display whats inside the alert
//     const message = document.getElementById('alertText');
//     alert.style.display = 'block';
//     message.innerHTML = msg;

//     // if there is no error and is for a successful message 
//     if (!isErr) {
//         iconWrap.innerHTML = '<i class="fa fa-check"></i>';
//     } else if (isErr) {
//         // if the alert is for errors
//         iconWrap.innerHTML = '<i class="fas fa-times"></i>';
//     }

//     setTimeout(() => {
//         alert.style.display = 'none';
//     }, 5000);
// };