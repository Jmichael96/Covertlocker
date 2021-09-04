let fetchedPadlocks = false;
let fetchedFolders = false;
let fetchedPadlockArr = [];
let fetchedFolderArr = [];
const folderContainer = document.getElementById('folderContainer');
const padlockContainer = document.getElementById('padlockContainer');
// variable to set the folder name to when user wants to delete
let selectedFolderForDeletion = '';

window.addEventListener('load', () => {
    if (!localStorage.getItem('hasAnsweredSecurityQuestion')) {
        document.getElementById('lockImg').style.display = 'block';
    }
});

const fetchFolders = async () => {
    renderLoader();
    await fetch(`/api/folder/fetch`, {
        method: 'GET',
        headers: headers
    }).then((res) => res.json())
        .then(async (data) => {
            fetchedFolders = true;
            if (data.status === 404) {
                document.getElementById('folderContainer').style.display = 'none';
                return;
            }
            removeLoader();
            fetchedFolderArr = data;
        }).catch((err) => {
            throw err;
        });
};

const fetchPadlocks = async () => {
    renderLoader();
    await fetch(`/api/padlock/fetch`, {
        method: 'GET',
        headers: headers
    }).then((res) => res.json())
        .then((data) => {
            fetchedPadlocks = true;
            if (data.status === 404) {
                document.getElementById('folderContainer').style.display = 'none';
                return;
            }
            removeLoader();
            fetchedPadlockArr = data;
        }).catch((err) => {
            throw err;
        });
};

// watches for the found user variable to change with user data
function setReadyListener() {
    const readyListener = async () => {
        if (foundUser) {
            if (!localStorage.getItem('hasAnsweredSecurityQuestion') && foundUser.security.question !== localStorage.getItem('securityQuestion')) {
                openModal(foundUser.security.question);
                return;
            }
            await fetchFolders();
            await fetchPadlocks();
            document.getElementById('lockImg').style.display = 'none';
            document.getElementById('padlockRoot').style.display = 'block';
            return;
        }
        return setTimeout(readyListener, 250);
    };
    readyListener();
};

// set the ready listener to watch if user has fetched both padlocks and folders
const readyListenerForData = () => {
    const readyListener = async () => {
        // console.log(fetchedPadlocks, fetchedFolders)
        if (fetchedPadlocks && fetchedFolders) {
            await renderFolders();
            return;
        }

        return setTimeout(readyListener, 250);
    };
    readyListener();
};

// on submit question button
document.getElementById('submitAnswerBtn').onclick = async (e) => {
    e.preventDefault();
    renderLoader();
    let answer = $('#answer').val();

    await fetch(`/api/padlock/fetch?` + new URLSearchParams({
        answer: answer,
        question: foundUser.security.question
    }), {
        method: 'GET',
        headers: headers,
    }).then((res) => res.json())
        .then(async (data) => {
            console.log(data);
            if (data.status === 401) {
                console.log('rendering error')
                await renderAlert(data.serverMsg, true);
                return;
            }
            if (data.status === 200) {
                await closeModal();
                localStorage.setItem('hasAnsweredSecurityQuestion', true);
                await fetchFolders();
                await fetchPadlocks();
                removeLoader();
            }
        }).catch(async (err) => {
            await renderAlert(err.serverMsg, true);
        });
};

// when folder button is clicked render the padlocks
const renderPadlocks = async (folderName) => {
    folderContainer.style.display = 'none';
    padlockContainer.style.display = 'block';

    let filteredArr = fetchedPadlockArr.filter(({ folder }) => folder === folderName);
    console.log(filteredArr)
    if (filteredArr.length <= 0) {
        renderAlert('You don\'t have any padlocks saved in this folder', true);
        // padlockContainer.innerHTML = `<h2 class="emptyMsg">Looks like you don't have any padlocks saved in this folder!</h2>`
        return;
    }
    padlockContainer.innerHTML = `${Object.values(filteredArr).map((padlock) => {
        return `
                <div class="padlockCard card">
                    <div class="padlockHead">
                        <main class="wrapper" style="justify-content: space-between;">
                            <h2 class="padlockTitle">${padlock.title}</h2>
                            <p class="padlockLastUsedDate">${moment(padlock.updatedAt).format('L LT')}</p>
                        </main>
                    </div>
                    <p class="padlockUsernameWrap">Username: 
                        <div class="padlockInputCopyWrap">
                            <input class="padlockInput" disabled value="${padlock.username}" />
                            <button name="${padlock.username}" class="copyBtn">Copy</button>
                        </div>
                    </p>
                    <p class="padlockPasswordWrap">Password: 
                        <div class="padlockInputCopyWrap">
                            <input  type="password" class="padlockInput" disabled value="${padlock.password}" />
                            <button name="${padlock.password}" class="copyBtn">Copy</button>
                        </div>
                    </p>

                    <textarea rows="4" disabled value="${padlock.notes}" class="padlockNotes">${padlock.notes}</textarea>
                    <main class="wrapper" style="justify-content: space-between">
                        <div class="padlockIconWrap">
                            <i class="fas fa-trash padlockIcon"></i>
                        </div>
                        <div class="padlockIconWrap">
                            <i class="fas fa-keyboard padlockIcon"></i>
                        </div>
                    </main>    
                </div>
            `
    }).join('')
        }`

    document.querySelectorAll('.copyBtn').forEach((el) => {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            let copyText = e.target.name;
            // create element to select value from
            let elm = $('<input style="position: absolute; bottom: -120%" type="text" value="' + copyText + '"/>').appendTo('body');
            elm[0].select();
            document.execCommand("copy");
            elm.remove();
            renderAlert('Copied to your clipboard!', false);
        });
    });
};

const renderFolders = async () => {
    document.getElementById('folderContainer').innerHTML = `${Object.values(fetchedFolderArr).map((f) => {
        return `
            <div value="null" name="${f.folderName}" class="folderCard card">
                <div value="delete" name="${f.folderName}" class="deleteFolderBtn"><i class="fas fa-trash folderTrashIcon"></i></div>
                <main value="null" name="${f.folderName}" class="wrapper" style="justify-content: space-between;">    
                    <h2 class="folderTitle">${f.folderName}</h2>
                    <p class="lastUsedDate">${moment(f.updatedAt).format('DD/MM/YYYY')}</p>
                </main>
            </div>
            `
    }).join('')
        }`;
    // find which folder is clicked on
    document.querySelectorAll('.folderCard').forEach((el) => {
        el.addEventListener('click', function (e) {
            // get the parents attribute "name"
            let folderName = $(e.target).parent().attr('name');

            // if value attribute is delete then we render the confirm delete modal
            if ($(e.target).parent().attr('value') === 'delete' || $(e.target).attr('value') === 'delete') {
                openConfirmModal('Are you sure? Deleting this will delete all padlocks contained in this folder.');
                let selectedFolder = $(e.target).parent().attr('name');
                if (typeof selectedFolder === 'undefined') {
                    selectedFolderForDeletion = $(e.target).attr('name')
                } else {
                    selectedFolderForDeletion = selectedFolder;
                }
                return;
            }
            
            if ($(e.target).parent().attr('value') === 'null' || $(e.target).attr('value') === 'null') {
                // if the element doesn't have a parent then get the name attribute from the parent
                if (typeof folderName === 'undefined') {
                    renderPadlocks($(e.target).attr('name'));
                } else {
                    renderPadlocks($(e.target).parent().attr('name'));
                }
            }
        });
    });
};

document.getElementById('confirmBtn').addEventListener('click', (e) => {
    e.preventDefault();
    deleteFolder(selectedFolderForDeletion);
});

const deleteFolder = async (folderName) => {
    await fetch(`/api/folder/delete/${folderName}?` + new URLSearchParams({
        padlocks: JSON.stringify(fetchedPadlockArr.filter(({ folder }) => folder === folderName))
    }), {
        method: 'DELETE',
        headers: headers
    }).then((res) => res.json())
        .then((data) => {
            if (data.status === 404) {
                renderAlert(data.serverMsg, true);
                return;
            }
            renderAlert(data.serverMsg, false);
            closeConfirmModal();
            fetchedFolderArr = fetchedFolderArr.filter((a) => a.folderName !== folderName);
            renderFolders();
        }).catch((err) => {
            console.log(err);
            renderAlert(err.serverMsg, true);
            throw err;
        });
};
setReadyListener();
readyListenerForData();