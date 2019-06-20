
// Url Requests
const get = function get(url) {
  return fetch(url).then(response => response.json());
};
const put = function put(url) {
  return fetch(url, {
    method: 'PUT'
  }).then(response => response.json());
};
const del = function del(url) {
  return fetch(url, {
    method: 'delete'
  }).then(response => response.json());
};
const post = function post(url) {
  return fetch(url, {
    method: 'POST'
  }).then(response => response.json());
};

//--------------------------------------------------
const getId = async function getId(url, name) {
  const jsonData = await get(url);
  const id = jsonData.reduce((acc, currVal) => {
    if (currVal.name === name) {
      acc = currVal.id;
    }
    return acc;
  }, '');
  return id;
};

//-------------------------------------------------------------------------------------------------------
const getCards = async function getCards(listId, key, token) {
  const listUrl = `https://api.trello.com/1/lists/${listId}/cards?key=${key}&token=${token}`;
  const cards = await get(listUrl);
  return cards;
};

//-------------------------------------------------------------------------------------------------------
const getAllCardIds = function getAllCardIds(cardsJsonData) {
  const cardIds = cardsJsonData.reduce((acc, currCard) => {
    acc.push(currCard.id);
    return acc;
  }, []);
  return cardIds;
};

//-------------------------------------------------------------------------------------------------------
function getCheckLists(cardId, key, token) {
  const checkListsUrl = `https://api.trello.com/1/cards/${cardId}/checklists?key=${key}&token=${token}`;
  return get(checkListsUrl);
}

const getAllCheckItems = async function getAllCheckItems(cardIds, key, token) {
  let checklistArray = [];
  const promises = [];
  for (let i = 0; i < cardIds.length; i += 1) {
    promises[i] = getCheckLists(cardIds[i], key, token);
  }
  checklistArray = await Promise.all(promises);
  console.log(checklistArray);
  const checkItemsArray = checklistArray.reduce((checkItems, checklist, index) => {
    const cardId = cardIds[index];
    checklist.forEach(() => {
      checklist[0].checkItems.forEach(element => {
        const checkItem = {
          cardId,
          id: element.id,
          name: element.name,
          state: element.state
        };
        checkItems.push(checkItem);
      });
    });
    return checkItems;
  }, []);
  return checkItemsArray;
};

//-------------------------------------------------------------------------------------------------------
const buildContent = function buildContent(checkItemsArray) {
  const myDiv = document.getElementById('list');
  checkItemsArray.forEach(element => {
    const p = document.createElement('p');
    p.className = `${element.cardId}`;
    p.id = `a${element.id}`;
    p.innerHTML = `<input type=checkbox data-card-id="${element.cardId}" data-id=a${element.id} class ="check-item" id = a${element.id}><label>${element.name}</label><span class = ${element.cardId} id=a${element.id}>&#10005;</span><br>`;
    myDiv.appendChild(p);
    if (element.state === 'complete') {
      document.querySelector(`#a${element.id}`).classList.add("checked");
      document.querySelector(`#a${element.id}`).style.cssText =
        'color: #d3d3d3; text-decoration: line-through #D3D3D3;';
      document.querySelector(`#a${element.id} #a${element.id}`).checked = true;
    } else {
      document.querySelector(`#a${element.id}`).style.cssText =
        'color: black; text-decoration: none;';
      document.querySelector(`#a${element.id} #a${element.id}`).checked = false;
    }
  });
  const addButton = document.createElement('p');
  addButton.innerHTML = '<input class=button type=button value=&#10010>';
  addButton.addEventListener('click', event => add(event));
  myDiv.appendChild(addButton);
  myDiv.addEventListener('change', event => update(event));
  myDiv.addEventListener('click', event => remove(event));
  document.body.appendChild(myDiv);
  document.body.style.cssText = 'background-color: #1e90ff;';
  myDiv.style.cssText = 'background-color: white; width: 35%; margin:auto; padding: 2%';
  document
    .querySelectorAll('span')
    .forEach(element => (element.style.cssText = 'float: right; cursor: pointer'));
};

//-------------------------------------------------------------------------------------------------------
async function update(event) {
  if (event.target.classList.contains('check-item')) {
    const itemId = event.target.id.slice(1);
    const cardId = event.target.getAttribute('data-card-id');

    event.target.checked ? (state = 'complete') : (state = 'incomplete');
    updateUrl = `https://api.trello.com/1/cards/${cardId}/checkItem/${itemId}?state=${state}&key=${key}&token=${token}`;
    await put(updateUrl);
    if (state === 'complete') {
      document.querySelector(`#${event.target.id}`).style.cssText =
        'color: #d3d3d3; text-decoration: line-through #D3D3D3;';
    }
    if (state === 'incomplete') {
      document.querySelector(`#${event.target.id}`).style.cssText =
        'color: black; text-decoration: none;';
    }
  }
}

//-------------------------------------------------------------------------------------------------------
async function remove(event) {
  // console.log('in remove', event.target)
  if (event.target.nodeName.toLowerCase() === 'span') {
    const itemId = event.target.id.slice(1);
    deleteUrl = `https://api.trello.com/1/cards/${event.target.className}/checkItem/${itemId}?key=${key}&token=${token}`;
    let response = await del(deleteUrl);
    response = await response.json();
    document.getElementById(event.target.id).remove();
  }

}

//-------------------------------------------------------------------------------------------------------
async function add(event) {
  event.stopPropagation();
  // console.log('in add', event.target)
  if (event.target.className === 'button') {
    const addItem = document.createElement('p');
    addItem.innerHTML = '<input type=text>';
    addItem.addEventListener('keypress', async event => {
      if (event.which === 13 || event.keyCode === 13) {
        const value = event.target.value;
        event.target.parentElement.remove();
        const splitValues = value.split(' ');
        const name = splitValues.reduce((string, currVal, idx) => {
          idx !== splitValues.length - 1 ? (string += `${currVal}%20`) : (string += currVal);
          return string;
        }, '');
        const defaultCheckListUrl = `https://api.trello.com/1/checklists/${defaultCheckListId}/checkItems?name=${name}&pos=bottom&checked=false&key=${key}&token=${token}`;
        const newCheckItem = await post(defaultCheckListUrl);
        console.log(newCheckItem);
        const cardId = (await get(
          `https://api.trello.com/1/checklists/${newCheckItem.idChecklist}/cards?key=${key}&token=${token}`
        ))[0].id;
        const checkItemArray = [{
          cardId,
          id: newCheckItem.id,
          name: newCheckItem.name,
          state: newCheckItem.state
        }];
        buildContent(checkItemArray);
      }
    });
    event.target.parentElement.insertBefore(addItem, event.target);
    event.target.remove();
  }
}


// Calling all functions below
let key = 'a71a2a6e920d2c4de0ff6a3c977dfbca';
let token = 'fcb04beb183631337d2659876641a6c88482102930147d398e30b87b9f1d9003';
let defaultCheckListId = '5d09d0192b03d40e322435ca';
const defaultCardId = '5d09c16eacb6fa065e5404e7';

const listsUrl = `https://api.trello.com/1/boards/1DOPhXcj/lists?key=${key}&token=${token}`;

getId(listsUrl, 'Project 4')
  .then(listId => getCards(listId, key, token))
  .then(cards => getAllCardIds(cards))
  .then(checkListIds => getAllCheckItems(checkListIds, key, token))
  .then(checkItemsArray => buildContent(checkItemsArray))
  .catch(error => console.log(error));