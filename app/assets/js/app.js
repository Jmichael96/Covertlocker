let foundUser;
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('x-auth-token', localStorage.token);

window.addEventListener('load', async () => {
    await fetch(`/api/auth/load_user`, {
        method: 'GET',
        headers: headers
    }).then((res) => res.json())
        .then((data) => {
            if (data.status === 401 || data.status === 404) {
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
                return;
            }
            foundUser = data;
        }).catch((err) => {
            window.location.href = '/';
            console.log(err);
        });
});

let timer, currSeconds = 0;

const resetTimer = () => {

    /* Clear the previous interval */
    clearInterval(timer);

    /* Reset the seconds of the timer */
    currSeconds = 0;

    /* Set a new interval */
    timer = setInterval(startIdleTimer, 1000);
};

// Define the events that
// would reset the timer
window.onload = resetTimer;
window.onmousemove = resetTimer;
window.onmousedown = resetTimer;
window.ontouchstart = resetTimer;
window.onclick = resetTimer;
window.onkeypress = resetTimer;

const startIdleTimer = async () => {
    // increment counter
    currSeconds++;
    // logout after 5 mins
    let fiveMin = 1200;

    if (currSeconds === fiveMin) {
        await handleLogout();
    }
};

const renderAlert = async (msg, isErr) => {
    const alert = document.getElementById('formAlert');
    const iconWrap = document.getElementById('alertIconWrap');
    // message section to display whats inside the alert
    const message = document.getElementById('alertText');
    alert.style.display = 'block';
    message.innerHTML = msg;

    // if there is no error and is for a successful message 
    if (!isErr) {
        iconWrap.innerHTML = '<i class="fa fa-check"></i>';
    } else if (isErr) {
        // if the alert is for errors
        iconWrap.innerHTML = '<i class="fa fa-close"></i>';
    }

    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
};

// for every location except the home page
if (window.location.pathname !== '/') {
    // logout button
    document.getElementById('logoutBtn').onclick = async () => {
        await handleLogout();
    };
    // when the user hits the cancel button in the modal
    document.getElementById('cancelConfirmBtn').addEventListener('click', () => {
        closeModal();
    });
}
// for the account and locker route
if (window.location.pathname === '/padlock') {
    // when the user clicks the decline button in the confirm modal
    document.getElementById('declineBtn').addEventListener('click', () => {
        closeConfirmModal();
    })
}

// logout function
const handleLogout = async () => {
    // let headers = new Headers();
    // headers.append('Content-Type', 'application/json');
    // headers.append('x-auth-token', localStorage.token);
    await fetch(`/api/auth/logout`, {
        method: 'PUT',
        headers: headers
    }).then((res) => res.json())
        .then(async (data) => {
            localStorage.removeItem('token');
            await renderAlert(data.serverMsg, false);
            window.location.href = '/';
        }).catch((err) => {
            console.log(err);
        });
}

// x button to close the modal
// document.getElementById('close-btn').addEventListener('click', function () {
//     closeModal();
// });

// overlay behind the modal to tap anywhere to close
// document.getElementById('overlay').addEventListener('click', function () {
//     closeModal();
// });

// open modal function
const openModal = (question) => {
    document.getElementById('overlay').classList.add('is-visible');
    document.getElementById('modal').classList.add('is-visible');
    if (question) {
        document.getElementById('question').innerHTML = foundUser.security.question
    }
};

// close modal function
const closeModal = () => {
    document.getElementById('overlay').classList.remove('is-visible');
    document.getElementById('modal').classList.remove('is-visible');
};

//! LOADER
// remove loader function
const removeLoader = () => {
    document.getElementById('loader').style.display = 'none';
}

// render loader 
const renderLoader = () => {
    document.getElementById('loader').style.display = 'block';
};

//! CONFIRM MODAL
// open modal function
const openConfirmModal = (msg) => {
    document.getElementById('overlay').classList.add('is-visible');
    document.getElementById('confirmModal').classList.add('is-visible');
    if (msg) {
        document.getElementById('confirmModalMsg').innerHTML = msg;
    }
};

// close modal function
const closeConfirmModal = () => {
    document.getElementById('overlay').classList.remove('is-visible');
    document.getElementById('confirmModal').classList.remove('is-visible');
};