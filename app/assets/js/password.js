let id, email;
// checkbox inputs
const characterCheck = document.getElementById('characterCheck');
const lowercaseCheck = document.getElementById('lowercaseCheck');
const uppercaseCheck = document.getElementById('uppercaseCheck');
const numCheck = document.getElementById('numberCheck');
const specialCheck = document.getElementById('specialCheck');

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
    if (!characterCheck.checked || !lowercaseCheck.checked || !uppercaseCheck.checked || !numCheck.checked || !specialCheck.checked) {
        await renderAlert('Your password doesn\'t meet the minimum requirements', true);
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

// on change event for password
document.getElementById('password').addEventListener('keyup', async function (e) {
    handleCheckboxes(this.value)
});

// function to check password requirement boxes upon users engagement
const handleCheckboxes = (passVal) => {
    if (passVal.length <= 5) {
        characterCheck.checked = false;
    } else if (passVal.length >= 6) {
        characterCheck.checked = true;
    }

    if (!/[a-z]/.test(passVal)) {
        lowercaseCheck.checked = false;
    } else if (/[a-z]/.test(passVal)) {
        lowercaseCheck.checked = true;
    }

    if (!/[A-Z]/.test(passVal)) {
        uppercaseCheck.checked = false;
    } else if (/[A-Z]/.test(passVal)) {
        uppercaseCheck.checked = true;
    }

    if (!/[0-9]/.test(passVal)) {
        numCheck.checked = false;
    } else if (/[0-9]/.test(passVal)) {
        numCheck.checked = true;
    }

    if (!/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(passVal)) {
        specialCheck.checked = false;
    } else if (/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(passVal)) {
        specialCheck.checked = true;
    }
};