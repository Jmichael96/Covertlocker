const editNameBtn = document.getElementById('editNameBtn');
const submitNameBtn = document.getElementById('submitNameBtn');
const editEmailBtn = document.getElementById('editEmailBtn');
const submitEmailBtn = document.getElementById('submitEmailBtn');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const root = document.getElementById('accountRoot');

setReadyListener();

// watches for the found user variable to change with user data
function setReadyListener() {
    const readyListener = async () => {
        if (foundUser) {
            removeLoader();
            assignInputValues();
            root.style.display = 'block '
            return;
        }
        return setTimeout(readyListener, 250);
    };
    readyListener();
};

const assignInputValues = () => {
    nameInput.value = foundUser.name;
    emailInput.value = foundUser.email;
    document.getElementById('membersDate').innerHTML = "User since " + moment(foundUser.date).format('L LT');
};

// when the user hits the edit name button
document.getElementById('editNameBtn').addEventListener('click', (e) => {
    e.preventDefault();
    editNameBtn.style.display = 'none';
    submitNameBtn.style.display = 'block';
    nameInput.removeAttribute('disabled');
    nameInput.style.backgroundColor = 'white';
    nameInput.style.border = '1px solid white';
});

// when user hits the edit email button
document.getElementById('editEmailBtn').addEventListener('click', (e) => {
    e.preventDefault();
    editEmailBtn.style.display = 'none';
    submitEmailBtn.style.display = 'block';
    emailInput.removeAttribute('disabled');
    emailInput.style.backgroundColor = 'white';
    emailInput.style.border = '1px solid white';
});

// when the user submits and saves the name 
document.getElementById('submitNameBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    nameInput.style.backgroundColor = '#ffffffc4';
    nameInput.style.border = '1px solid #ffffffc4';
    if (nameInput.value === foundUser.name) {
        editNameBtn.style.display = 'block';
        submitNameBtn.style.display = 'none';
        nameInput.setAttribute('disabled', true);
        return;
    }
    let formData = {
        name: nameInput.value
    };

    await fetch(`/api/auth/update_name/${foundUser._id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(formData)
    }).then((res) => res.json())
    .then(async (data) => { 
        if (data.status === 401 || data.status === 404) {
            await renderAlert(data.serverMsg, true);
            return;
        }
        editNameBtn.style.display = 'block';
        submitNameBtn.style.display = 'none';
        nameInput.setAttribute('disabled', true);
        await renderAlert(data.serverMsg, false);
        foundUser = data.user;
    }).catch(async (err) => {
        await renderAlert(err.serverMsg, true);
        throw err;
    });
});

// when the user submits and saves the email
document.getElementById('submitEmailBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    emailInput.style.backgroundColor = '#ffffffc4';
    emailInput.style.border = '1px solid #ffffffc4';
    if (emailInput.value === foundUser.email) {
        editEmailBtn.style.display = 'block';
        submitEmailBtn.style.display = 'none';
        emailInput.setAttribute('disabled', true);
        return;
    }

    let formData = {
        email: emailInput.value
    };

    await fetch(`/api/auth/update_email/${foundUser._id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(formData)
    }).then((res) => res.json())
    .then(async (data) => { 
        if (data.status === 401 || data.status === 404) {
            await renderAlert(data.serverMsg, true);
            return;
        }
        editEmailBtn.style.display = 'block';
        submitEmailBtn.style.display = 'none';
        emailInput.setAttribute('disabled', true);
        await renderAlert(data.serverMsg, false);
        foundUser = data.user;
    }).catch(async (err) => {
        await renderAlert(err.serverMsg, true);
        throw err;
    });
});

// when the user clicks to change the security question and answer
document.getElementById('changeSecurityBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    renderSpinner('changeSecurityBtn');

    let formData = {
        subject: 'Change Covertlocker security question',
        type: 'security'
    };

    await fetch(`/api/auth/init_change_security/${foundUser.email}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData)
    }).then((res) => res.json())
    .then(async (data) => {
        removeSpinner('changeSecurityBtn', 'Change Security Question/Answer')
        await renderAlert(data.serverMsg, false);
    }).catch(async (err) => {
        removeSpinner('changeSecurityBtn', 'Change Security Question/Answer')
        await renderAlert(err.serverMsg, true);
        throw err;
    });
});

// when user clicks to change password
document.getElementById('changePasswordBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    renderSpinner('changePasswordBtn');
    let formData = {
        subject: 'Covertlocker change password',
        type: 'password'
    };

    await fetch(`/api/auth/init_change_password/${foundUser.email}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData)
    }).then((res) => res.json())
    .then(async (data) => {
        removeSpinner('changePasswordBtn', 'Change Password')
        await renderAlert(data.serverMsg, false);
    }).catch(async (err) => {
        removeSpinner('changePasswordBtn', 'Change Password')
        await renderAlert(err.serverMsg, true);
        throw err;
    });
})