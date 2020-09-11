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

buildList();

function buildList(){
    let wrapper = document.getElementById('list-wrapper');
    //wrapper.innerHTML = ''

    const url = 'http://127.0.0.1:8000/api/task-list/';
    fetch(url)
    .then((resp) => resp.json())
    .then(function(data){
        console.log('Data:', data);

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

            const item = `
                <div id="data-row-${i}" class="task-wrapper flex-wrapper">
                    <div style="flex:7">
                        ${title}
                    </div>
                    <div style="flex:1">
                        <button class="btn btn-sm btn-outline-info edit">Edit</button>
                    </div>
                    <div style="flex:1">
                        <button class="btn btn-sm btn-outline-dark delete">-</button>
                    </div>
                </div>
            `;
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
            const deleteBtn = document.getElementsByClassName('delete')[i];
            const title = document.getElementsByClassName('title')[i];

            editBtn.addEventListener('click', (function(item){
                return function(){
                    editItem(item);
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
    console.log('Item clicked:', item);
    activeItem = item;
    document.getElementById('title').value = activeItem.title;
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