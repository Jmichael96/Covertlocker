let fetchedPadlocks = false;
let fetchedFolders = false;
let fetchedPadlockArr = [];
let fetchedFolderArr = [];
let copyPadlockArr = [];
let filteredPadlockArr;
let deleteType = '';
const folderContainer = document.getElementById('folderContainer');
const padlockContainer = document.getElementById('padlockContainer');
const filterBarWrapper = document.getElementById('filterWrapper');
const filterInput = document.getElementById('filterInput');
const orderByInput = document.getElementById('orderBy');
// variable to set the folder name to when user wants to delete
let selectedFolderForDeletion = '';
// variable to set the padlock id to when user wants to delete
let currentSelectedPadlock = '';
// saves what folder directory the user is in
let folderDir = '';
// set the isEditing variable truthy or falsy when the user answers security question
let isEditing = false;


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
                removeLoader()
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
                localStorage.setItem('hasAnsweredSecurityQuestion', false);
                openModal(foundUser.security.question);
                return;
            } else if (localStorage.getItem('hasAnsweredSecurityQuestion') && foundUser.security.question !== localStorage.getItem('securityQuestion')) {
                localStorage.setItem('hasAnsweredSecurityQuestion', false);
                openModal(foundUser.security.question);
                return;
            } else if (foundUser.email !== localStorage.getItem('email')) {
                localStorage.setItem('hasAnsweredSecurityQuestion', false);
                openModal(foundUser.security.question);
            }
            await fetchFolders();
            await fetchPadlocks();
            document.getElementById('lockImg').style.display = 'none';
            return;
        }
        return setTimeout(readyListener, 250);
    };
    readyListener();
};

// set the ready listener to watch if user has fetched both padlocks and folders
const readyListenerForData = () => {
    const readyListener = async () => {
        if (fetchedFolders && fetchedPadlocks) {
            document.getElementById('padlockRoot').style.display = 'block';
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
    // renderLoader();
    let answer = $('#answer').val();
    let formData = {
        answer: answer,
        question: foundUser.security.question
    };
    if (!isEditing) {
        renderLoader();
        await fetch(`/api/auth/check_security`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(formData)
        }).then((res) => res.json())
            .then(async (data) => {
                if (data.status === 401) {
                    await renderAlert(data.serverMsg, true);
                    return;
                }
                removeLoader();
                localStorage.setItem('hasAnsweredSecurityQuestion', true);
                localStorage.setItem('securityQuestion', foundUser.security.question);
                localStorage.setItem('email', foundUser.email)
                closeModal();
                await fetchFolders();
                await fetchPadlocks();
                document.getElementById('lockImg').style.display = 'none';
                document.getElementById('padlockRoot').style.display = 'block';
            }).catch(async (err) => {
                console.log(err);
                await renderAlert(err.serverMsg, true);
            });
    } else if (isEditing) {
        await fetch(`/api/auth/check_security`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(formData)
        }).then((res) => res.json())
            .then(async (data) => {
                if (data.status === 401) {
                    await renderAlert(data.serverMsg, true);
                    return;
                }
                await closeModal();
                redirectToEditPage(currentSelectedPadlock, 'padlock');
            }).catch(async (err) => {
                console.log(err);
                await renderAlert(err.serverMsg, true);
            });
    }
};

// when folder button is clicked render the padlocks
const renderPadlocks = async (folderName) => {
    folderContainer.style.display = 'none';
    padlockContainer.style.display = 'block';
    filterBarWrapper.style.display = 'flex';

    if (folderName) {
        filteredPadlockArr = fetchedPadlockArr.filter(({ folder }) => folder === folderName);
    }

    if (filteredPadlockArr.length <= 0) {
        renderAlert('You don\'t have any padlocks saved in this folder', true);
        return;
    }
    padlockContainer.innerHTML = `${Object.values(copyPadlockArr.length <= 0 ? filteredPadlockArr : copyPadlockArr).map((padlock) => {
        return `
                <div class="padlockCard card">
                    <div class="padlockHead">
                        <main class="wrapper" style="justify-content: space-between;">
                        <h2 class="padlockTitle">${padlock.title}</h2>
                        <p class="padlockLastUsedDate">${padlock.updatedAt ? moment(padlock.updatedAt).format('L LT') : moment(padlock.createdAt).format('L LT')}</p>
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
                        <div value="${padlock._id}" class="padlockIconWrap padlockDeleteWrap">
                            <i class="fas fa-trash padlockIcon"></i>
                        </div>
                        <div value="${padlock._id}" class="padlockIconWrap padlockUpdateWrap">
                            <i class="fas fa-keyboard padlockIcon"></i>
                        </div>
                    </main>    
                </div>
            `
    }).join('')
        }`
    // when user hits the copy button for the specified inputs
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
    // when user hits delete button on padlock
    document.querySelectorAll('.padlockDeleteWrap').forEach((el) => {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            deleteType = 'padlock';
            let padlockId = $(e.target).parent().attr('value');

            if (typeof padlockId === 'undefined') {
                currentSelectedPadlock = $(e.target).attr('value');
            } else {
                currentSelectedPadlock = $(e.target).parent().attr('value');
            }
            openConfirmModal('Are you sure? This cannot be undone.');
        });
    });
    // when user hits the edit button on the padlock
    document.querySelectorAll('.padlockUpdateWrap').forEach((el) => {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            isEditing = true;
            openModal(foundUser.security.question);
            // need to ask for security question before allowing edit and viewing password
            let padlockId = $(e.target).parent().attr('value');

            if (typeof padlockId === 'undefined') {
                currentSelectedPadlock = $(e.target).attr('value');
            } else {
                currentSelectedPadlock = $(e.target).parent().attr('value');
            }
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
                    <p class="lastUsedDate">${f.updatedAt ? moment(f.updatedAt).format('DD/MM/YYYY') : moment(f.createdAt).format('DD/MM/YYYY')}</p>
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
                deleteType = 'folder';
                openConfirmModal('Are you sure? Deleting this will delete all padlocks contained in this folder.');
                let selectedFolder = $(e.target).parent().attr('name');
                if (typeof selectedFolder === 'undefined') {
                    selectedFolderForDeletion = $(e.target).attr('name');
                } else {
                    selectedFolderForDeletion = selectedFolder;
                }
                return;
            }

            if ($(e.target).parent().attr('value') === 'null' || $(e.target).attr('value') === 'null') {
                // if the element doesn't have a parent then get the name attribute from the parent
                if (typeof folderName === 'undefined') {
                    renderPadlocks($(e.target).attr('name'));
                    folderDir = $(e.target).attr('name');
                } else {
                    renderPadlocks($(e.target).parent().attr('name'));
                    folderDir = $(e.target).parent().attr('name');
                }
            }
        });
    });
};

document.getElementById('confirmBtn').addEventListener('click', (e) => {
    e.preventDefault();
    switch (deleteType) {
        case 'folder':
            deleteFolder(selectedFolderForDeletion);
            break;
        case 'padlock':
            deletePadlock(currentSelectedPadlock);
        default: return;
    }
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

const deletePadlock = async (padlockId) => {
    await fetch(`/api/padlock/delete/${padlockId}`, {
        method: 'DELETE',
        headers: headers
    }).then((res) => res.json())
        .then(async (data) => {
            if (data.status === 404) {
                renderAlert(data.serverMsg, true);
                return;
            }
            fetchedPadlockArr = fetchedPadlockArr.filter((a) => a._id !== padlockId);
            console.log(fetchedPadlockArr);
            await renderAlert(data.serverMsg, false);
            closeConfirmModal();
            await renderPadlocks(folderDir);
        }).catch((err) => {
            renderAlert(err.serverMsg, true);
            throw err;
        });
};

const redirectToEditPage = (id, type) => {
    window.location.href = `/update?data=${id}&type=${type}`;
};

setReadyListener();
readyListenerForData();

filterInput.addEventListener('keyup', async function (e) {
    // repopulate copyPadlockArr with the already filtered padlock array
    copyPadlockArr = filteredPadlockArr;
    // then filter copy array with the newly added search params
    copyPadlockArr = copyPadlockArr.filter((a) => JSON.stringify(a.title.toLowerCase()).includes(this.value.toLowerCase()));
    // last render the padocks
    await renderPadlocks();
});

orderByInput.addEventListener('change', async function (e) {
    if (this.value) {
        switch (this.value) {
            case '1':
                copyPadlockArr.length <= 0 && filteredPadlockArr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                copyPadlockArr.length >= 1 && copyPadlockArr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
            case '2':
                copyPadlockArr.length <= 0 && filteredPadlockArr.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
                copyPadlockArr.length >= 1 && copyPadlockArr.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
                break;
            default: 
            copyPadlockArr.length <= 0 && filteredPadlockArr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            copyPadlockArr.length >= 1 && copyPadlockArr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                return;
        }
        await renderPadlocks();
    }
});