function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

let activeItem = null;
let list_snapshot = [];
let activeNotes = false;
let activeNotesItem = null;

buildList();

function buildList(){
    let wrapper = document.getElementById('list-wrapper');

    const url = 'http://127.0.0.1:8000/api/task-list/';
    fetch(url)
    .then((resp) => resp.json())
    .then(function(data){
//        console.log('Data:', data);

        const list = data;
        for (let i in list){

            try{
                document.getElementById(`data-row-${i}`).remove();
            }catch(err){
            }

            let title = `<span class="title">${list[i].title}</span>`
            if (list[i].completed == true){
                title = `<strike class="title">${list[i].title}</strike>`
            }
            let item =`
                <div id="data-row-${i}" >
                    <div class="task-wrapper flex-wrapper">
                        <div style="flex:6">
                            ${title}
                        </div>
                        <div style="flex:1">
                            <button class="btn btn-sm btn-outline-info edit">Edit</button>
                        </div>
                        <div style="flex:1">
                            <button id="button${list[i].id}" class="btn btn-sm btn-outline-warning notes">Notes</button>
                        </div>
                        <div style="flex:0">
                            <button class="btn btn-sm btn-outline-dark delete">-</button>
                        </div>
                    </div>
                `;
            if(activeNotes==true && activeNotesItem.id === list[i].id){
                item += `
                    <textarea id="notes${list[i].id}" rows="10" cols="120" style="max-width:100%;">${list[i].notes}</textarea>
                </div>
            `;
            } else{
                item += `
                </div>
                `
            }
            wrapper.innerHTML += item;
        }

        if (list_snapshot.length > list.length){
            for(let i = list.length; i < list_snapshot.length; i++){
                document.getElementById(`data-row-${i}`).remove();
            }
        }

        list_snapshot = list;

        for (let i in list){
            const editBtn = document.getElementsByClassName('edit')[i];
            const noteBtn = document.getElementsByClassName('notes')[i];
            const deleteBtn = document.getElementsByClassName('delete')[i];
            const title = document.getElementsByClassName('title')[i];

            editBtn.addEventListener('click', (function(item){
                return function(){
                    editItem(item);
                }
            })(list[i]));

            noteBtn.addEventListener('click', (function(item){
                return function(){
                    showNotes(item);
                }
            })(list[i]));

            deleteBtn.addEventListener('click', (function(item){
                return function(){
                    deleteItem(item);
                }
            })(list[i]));

            title.addEventListener('click', (function(item){
                return function(){
                    strikeUnstrike(item);
                }
            })(list[i]));
        }
    })
}

const form = document.getElementById('form-wrapper');
form.addEventListener('submit', function(e){
    e.preventDefault();
    console.log('Form submitted');
    let url = 'http://127.0.0.1:8000/api/task-create/';
    if (activeItem != null){
        url = `http://127.0.0.1:8000/api/task-update/${activeItem.id}/`;
        activeItem = null;
    }
    const title = document.getElementById('title').value;
    fetch(url, {
        method:'POST',
        headers:{
            'Content-type':'application/json',
            'X-CSRFToken': csrftoken,
        },
        body:JSON.stringify({'title': title})
    }
    ).then(function(response){
        buildList();
        document.getElementById('form').reset();
    })
});

function editItem(item){
    activeItem = item;
    document.getElementById('title').value = activeItem.title;
}

function showNotes(item){
    activeNotesItem = item;
    if(activeNotes){
        const note = document.getElementById(`notes${item.id}`).value;
        fetch(`http://127.0.0.1:8000/api/task-update/${item.id}/`, {
            method:'POST',
            headers:{
                'Content-type':'application/json',
                'X-CSRFToken': csrftoken,
            },
            body:JSON.stringify({'title':item.title, 'notes': note})
        }
        ).then(function(response){
            buildList();
        })
    }else{
        buildList();
    }
    activeNotes = !activeNotes;
}

function deleteItem(item){
    console.log('Delete clicked');
    fetch(`http://127.0.0.1:8000/api/task-delete/${item.id}/`, {
        method:'DELETE',
        headers:{
            'Content-type':'application/json',
            'X-CSRFToken': csrftoken,
        }
    }).then((response) => {
        buildList();
    })
}

function strikeUnstrike(item){
    console.log('strike clicked');

    item.completed = !item.completed;
    fetch(`http://127.0.0.1:8000/api/task-update/${item.id}/`, {
        method:'POST',
        headers:{
            'Content-type':'application/json',
            'X-CSRFToken': csrftoken,
        },
        body:JSON.stringify({'title':item.title, 'completed':item.completed})
    }).then((response) => {
        buildList();
    })
}