// const fetch = require('node-fetch');

let get = function(url) {
    return fetch(url).then(response => response.json());
}
let put = function(url) {
    return fetch(url, {method: 'PUT'})
}
let del = function(url) {
    return fetch(url, {method: 'delete'})
}
// module.exports.get = get;

let getId = async function (url, name) {
    let jsonData = await get(url);
    let id = jsonData.reduce((acc, currVal) => {
        if (currVal.name === name) {
            acc = currVal.id;
        }
        return acc;
    }, '');
    return id;
}
// module.exports.getId = getId;

let getCards = async function (listId, key, token) {
    let listUrl = 'https://api.trello.com/1/lists/' + listId + '/cards?key=' + key + '&token=' + token;
    let cards = await get(listUrl);
    return cards;
}
// module.exports.getCards = getCards

let getAllCardIds = function(cardsJsonData) {
    // console.log(cardsJsonData);
    
    let cardIds = cardsJsonData.reduce((acc, currCard) => {
        acc.push(currCard.id);
        return acc
    }, [])
    return cardIds;
}
// module.exports.getAllChecklistsIds = getAllChecklistsIds;

function getCheckLists(cardId, key, token) {
    let checkListsUrl = `https://api.trello.com/1/cards/${cardId}/checklists?key=${key}&token=${token}`;
    return get(checkListsUrl);
}

let getAllCheckItems = async function(cardIds, key, token) {
    let checklistArray = [];
    for(let i = 0; i < cardIds.length; i++) {
        checklistArray[i] = await getCheckLists(cardIds[i], key, token);
    }
    let checkItemsArray = checklistArray.reduce((checkItems, checklist, index) => {
        let cardId = cardIds[index];
        checklist.forEach(element => {   
            checklist[0].checkItems.forEach(element => {
                let checkItem = {
                    "cardId": cardId,
                    "id": element.id,
                    name: element.name,
                    state: element.state  
                };
                checkItems.push(checkItem);
            })
        });
        return checkItems;
    }, [])
    return checkItemsArray;
}
// module.exports.getAllCheckItems = getAllCheckItems;

let buildContent = function (checkItemsArray) {
    var myDiv = document.getElementById("list"); 
    
    let complete = document.createElement('style');
    complete.innerHTML = `.complete{text-decoration: line-through #D3D3D3;}`
    checkItemsArray.forEach(element => {
        // console.log(element);
        let p = document.createElement('p');
        p.id = 'a' + element.id;
        // p.class = 'checkItem'
        p.innerHTML = `<input type=checkbox class = ${element.cardId} id = a${element.id}><label>${element.name}</label><span class = ${element.cardId} id=a${element.id}>&#10005;</span><br>`;
        myDiv.appendChild(p);
        // let 
        if(element.state === 'complete') {
            document.querySelector(`#a${element.id}`).style.cssText = 'color: #d3d3d3; text-decoration: line-through #D3D3D3;';
            document.querySelector(`#a${element.id} #a${element.id}`).checked = true;
        } else {
            document.querySelector(`#a${element.id}`).style.cssText = 'color: black; text-decoration: none;';
            document.querySelector(`#a${element.id} #a${element.id}`).checked = false;
        }
    })

    let addButton = document.createElement('p');
    addButton.class = 'button';
    addButton.innerHTML = '<input type=button value=&#10010>';
    addButton.addEventListener('click', (event => add(event)));
    myDiv.appendChild(addButton);
    
    // console.log(addButton);

    myDiv.addEventListener('change', (event) => update(event));
    myDiv.addEventListener('click', (event) => remove(event));
    document.body.appendChild(myDiv);
    document.body.style.cssText = 'background-color: #1e90ff;';
    myDiv.style.cssText = 'background-color: white; width: 35%; margin:auto; padding: 2%'    
    // document.getElementsByClassName('.checkItem').forEach(element => element.style.cssText = 'cursor: pointer')
    document.querySelectorAll('span').forEach(element => element.style.cssText = 'float: right; cursor: pointer')
}

async function update(event) {
    console.log(event.target.id);
    let itemId = (event.target.id).slice(1);
    ((event.target).checked) ? (state = 'complete') : (state = 'incomplete');
    updateUrl = `https://api.trello.com/1/cards/${event.target.className}/checkItem/${itemId}?state=${state}&key=${key}&token=${token}`
    await put(updateUrl);
    // console.log(document.querySelector(`#${event.target.id}`));
    if(state === 'complete') {
        document.querySelector(`#${event.target.id}`).style.cssText = 'color: #d3d3d3; text-decoration: line-through #D3D3D3;';
    } 
    if(state === 'incomplete') {
        document.querySelector(`#${event.target.id}`).style.cssText = 'color: black; text-decoration: none;';
    }
}

async function remove(event) {
    if(event.target.nodeName.toLowerCase() === 'span') {
        let itemId = (event.target.id).slice(1);
        console.log(itemId);
        deleteUrl = `https://api.trello.com/1/cards/${event.target.className}/checkItem/${itemId}?key=${key}&token=${token}`;
        await del(deleteUrl);
        document.getElementById(event.target.id).remove();
    }
} 

async function add(event) {
    console.log(event.target.parentElement);
    event.target.parentElement
    console.log(document.querySelector('#list').lastChild)
}


// module.exports.addItems = addItems;


// Calling all functions below

let key = 'a71a2a6e920d2c4de0ff6a3c977dfbca';
let token = 'fcb04beb183631337d2659876641a6c88482102930147d398e30b87b9f1d9003';

const listsUrl = 'https://api.trello.com/1/boards/1DOPhXcj/lists?key=' + key + '&token=' + token;

getId(listsUrl, 'Project 4')
.then(listId => getCards(listId, key, token))
.then(cards => getAllCardIds(cards))
.then(checkListIds => getAllCheckItems(checkListIds, key, token))
.then(checkItemsArray => buildContent(checkItemsArray))
.catch(error => console.log(error))
