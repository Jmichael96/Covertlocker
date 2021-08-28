window.addEventListener('load', async () => {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('x-auth-token', localStorage.token);

    await fetch(`/api/auth/load_user`, {
        method: 'GET',
        headers: headers
    }).then((res) => res.json())
        .then((data) => {
            if (!data) {
                window.location.href = '/';
            }
            console.log('found user');
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
        iconWrap.innerHTML = '<i class="fas fa-times"></i>';
    }

    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
};

if (window.location.pathname !== '/') {
    // logout button
    document.getElementById('logoutBtn').onclick = async () => {
        await handleLogout();
    };
}

// logout function
const handleLogout = async () => {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('x-auth-token', localStorage.token);
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