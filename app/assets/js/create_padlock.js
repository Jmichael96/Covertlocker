let folderArr = [];
const root = document.getElementById('createRoot');

setReadyListener();

// watches for the found user variable to change with user data
function setReadyListener() {
    const readyListener = async () => {
        if (foundUser) {
            await fetchFolders();
            root.style.display = 'block'
            return;
        }
        return setTimeout(readyListener, 250);
    };
    readyListener();
};

document.getElementById('createForm').onsubmit = async (e) => {
    e.preventDefault();

    let title = $('#title').val();
    let username = $('#username').val().trim();
    let password = $('#password').val().trim();
    let notes = $('#notes').val();
    let folder = $('#folder').val();

    if (!title || !username || !password) {
        await renderAlert('Please enter the required fields', true);
        return
    }
    renderSpinner('submitBtn');
    // ! THIS ISN'T BEING CREATED FOR SOME REASON
    if (!folder) {
        await createFolder('Default');
    }
    let formData = {
        title,
        username,
        password,
        notes,
        folder: !folder ? 'Default' : folder
    };

    await fetch(`/api/padlock/create`, {
        method: 'POST',
        headers: headers,
        mode: 'cors',
        body: JSON.stringify(formData)
    }).then((res) => res.json())
        .then(async (data) => {
            removeSpinner('submitBtn', 'Submit');
            await renderAlert(data.serverMsg, false);
            clearForm();
        }).catch(async (err) => {
            removeSpinner('submitBtn', 'Submit');
            await renderAlert(err.serverMsg, true);
        });
};

const fetchFolders = async () => {
    renderLoader();
    await fetch(`/api/folder/fetch`, {
        method: 'GET',
        headers: headers
    }).then((res) => res.json())
        .then(async (data) => {
            if (data.status === 404) {
                document.getElementById('folder').innerHTML = '<option selected value="">Select a folder</option>'
                removeLoader();
                return;
            }
            folderArr = data;
            await renderFolderOptions();
            removeLoader();
        }).catch(async (err) => {
            await renderAlert(err.serverMsg, true);
        });
};

const renderFolderOptions = async () => {
    document.getElementById('folder').innerHTML = `<option selected value="">Select a folder</option>
    ${Object.values(folderArr).map((folder) => {
        const formattedStr = folder.folderName.charAt(0).toUpperCase() + folder.folderName.slice(1)
        return `<option value="${formattedStr}">${formattedStr}</option>`
    })}`
};

const createFolder = async (defaultFolderName) => {

    let folderName = $('#folderName').val();

    let formData = {
        folderName: !folderName ? defaultFolderName : folderName
    };

    await fetch(`/api/folder/create`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData)
    }).then((res) => res.json())
        .then(async (data) => {
            if (data.status === 406) {
                return;
            }
            await renderAlert(data.serverMsg, false);
            await fetchFolders();
            await closeModal();
        }).catch(async (err) => {
            await renderAlert(err.serverMsg, true);
        });
};

// when the user submits the form to create a folder
document.getElementById('createFolderSubmit').onclick = async (e) => {
    e.preventDefault();
    await createFolder(null);
};

document.getElementById('createFolderBtn').onclick = async () => {
    await openModal();
};

const clearForm = () => {
    $('#title').val('');
    $('#username').val('');
    $('#password').val('');
    $('#notes').val('');
    $('#folder').val('');
};