let url,
    id,
    type,
    padlock;
const updateRoot = document.getElementById('updateRoot');

window.addEventListener('load', async () => {
    url = new URL(window.location.href)
    id = url.searchParams.get('data');
    type = url.searchParams.get('type');

    if (id) {
        await fetch(`/api/padlock/fetch_padlock/${id}`, {
            method: 'GET',
            headers: headers
        }).then((res) => res.json())
            .then(async (data) => {
                if (data.status === 404) {
                    await renderAlert(data.serverMsg, true);
                    return;
                }
                await removeLoader();
                if (type === 'padlock') {
                    padlock = data;
                    renderPadlock(data);
                } else if (type === 'folder') {
                    renderFolder(data);
                }
            }).catch(async (err) => {
                await renderAlert(err.serverMsg, true);
            });
    }
});

const renderPadlock = async (data) => {
    updateRoot.innerHTML = `
        <form id="updateForm" class="updateForm">
            <div class="inputWrap">
                <label class="label">Folder</label>
                <select name="folder" class="input" id="updateFolder"></select>
            </div>
            <div class="inputWrap">
                <label class="label">Title *</label>
                <input id="title" value="${data.title}" placeholder="Title" name="title" class="input" />
            </div>
            <div class="inputWrap">
                <label class="label">Username *</label>
                <input id="username" value="${data.username}" placeholder="Username or email" name="username" class="input" />
            </div>
            <div class="inputWrap">
                <label class="label">Password *</label>
                <input id="password" value="${data.password}" placeholder="Password" name="password" class="input" />
            </div>
            <div class="inputWrap">
                <label class="label">Notes</label>
                <textarea id="notes" name="notes" class="input" cols="30" rows="10">${data.notes}</textarea>
            </div>
            <main class="wrapper" style="justify-content: flex-end;">
                <button type="submit" class="btn">Submit</button>
            </main>
        </form>
    `
    await fetchFolders();
    await initiateFormEventListener();
    document.getElementById('updateFolder').value = data.folder
};

const renderUpdateFolders = (folders) => {

    document.getElementById('updateFolder').innerHTML = `
    <option selected value="">Select a folder</option>
    ${Object.values(folders).map((folder) => {
        return `<option selected="${padlock.folder === folder.folderName ? true : false}" value="${folder.folderName}">${folder.folderName}</option>`
    })
        }`
};

const fetchFolders = async () => {
    await fetch(`/api/folder/fetch`, {
        method: 'GET',
        headers: headers
    }).then((res) => res.json())
        .then(async (data) => {
            if (data.status === 404) {
                document.getElementById('folder').innerHTML = '<option selected value="">Select a folder</option>'
                return;
            }
            renderUpdateFolders(data);
            removeLoader();
            return;
        }).catch(async (err) => {
            await renderAlert(err.serverMsg, true);
        });
};

const initiateFormEventListener = async () => {
    document.getElementById('updateForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        let folder = $('#updateFolder').val();
        let title = $('#title').val();
        let username = $('#username').val().trim();
        let password = $('#password').val().trim();
        let notes = $('#notes').val();

        // check if all values are the same. if so then don't submit anything
        if (padlock.folder === folder && padlock.title === title && padlock.username === username && padlock.password === password && padlock.notes === notes) {
            await renderAlert('You haven\'t made any changes to save.', true);
            return;
        }

        let formData = {
            title,
            username,
            password,
            folder,
            notes
        };
        console.log(formData)
        await fetch(`/api/padlock/update/${padlock._id}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(formData)
        }).then((res) => res.json())
            .then(async (data) => {
                if (data.status === 404) {
                    await renderAlert(data.serverMsg, true);
                    return;
                }
                await renderAlert(data.serverMsg, false);
                // setTimeout(() => {window.location.href = '/padlock';}, 2000)
            }).catch(async (err) => {
                await renderAlert(err.serverMsg, true);
                throw err;
            });
    });
};