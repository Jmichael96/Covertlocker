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
    console.log(formData);
    await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData)
    }).then((res) => res.json())
        .then(async (data) => {
            if (data.status === 401) {
                renderAlert(data.serverMsg, true);
                return;
            }
            console.log('logged in');
            localStorage.setItem('token', data.token);
            // window.location.href = '/account';
            console.log(data)
        }).catch(async (err) => {
            console.log(err);
            await renderAlert(err.serverMsg, true);
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
            await renderAlert(err.serverMsg, true);
        });
};

// if user selects the forgot password button
document.getElementById('forgotPassBtn').addEventListener('click', () => { openModal(null) })

// when user submits forgot password with their email
document.getElementById('submitForgotPassword').addEventListener('click', async (e) => {
    e.preventDefault();
    let email = $('#forgotPassEmail').val().trim();

    let formData = {
        subject: 'Forgot Password',
    };

    await fetch(`/api/auth/forgot_password/${email}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(formData)
    }).then((res) => res.json())
        .then(async (data) => {
            if (data.status === 404) {
                await renderAlert(data.serverMsg, true);
                return;
            }
            closeModal();
            await renderAlert(data.serverMsg, false);
        }).catch(async (err) => {
            await renderAlert(err.serverMsg, true);
            throw err;
        });
});

// function to check password requirement boxes upon users engagement
const handleCheckboxes = () => {

};