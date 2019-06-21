
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
    method: 'DELETE'
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
  let flattenedArray = (checklistArray.flat());
  const checkItemsArray = flattenedArray.reduce((checkItems, checklist) => {
    let cardId = checklist.idCard;
    (checklist.checkItems).forEach(checkItem => {
      checkItem['cardId'] = cardId;
      checkItems.push(checkItem);
    })
    return checkItems;
  }, [])
  return checkItemsArray;
};

//-------------------------------------------------------------------------------------------------------
const buildContent = function buildContent(checkItemsArray) {
  const myDiv = document.getElementById('list');
  checkItemsArray.forEach(element => {
    const p = document.createElement('p');
    p.setAttribute('data-card-id', `${element.cardId}`);
    p.setAttribute('data-id', `a${element.id}`);
    p.innerHTML = `<input type=checkbox  class ="checkBox"><label>${element.name}</label><span>&#10005;</span><br>`;
    myDiv.appendChild(p);
    if (element.state === 'complete') {
      document.querySelector(`[data-id = a${element.id}]`).classList.add("checkItemsChecked");
      document.querySelector(`[data-id = a${element.id}] input`).checked = true;
    } else {
      document.querySelector(`[data-id = a${element.id}]`).classList.add("checkItemsUnchecked");
      document.querySelector(`[data-id = a${element.id}] input`).checked = false;
    }
  });
  const addButton = document.createElement('p');
  addButton.innerHTML = '<input class=btn type=button value=&#10010>';
  addButton.addEventListener('click', event => add(event));
  myDiv.appendChild(addButton);
  myDiv.addEventListener('change', event => update(event));
  myDiv.addEventListener('click', event => remove(event));
  document.body.appendChild(myDiv);
};

//-------------------------------------------------------------------------------------------------------
async function update(event) {
  if (event.target.classList.contains('checkBox')) {
    const itemId = event.target.parentNode.dataset.id.slice(1);
    const cardId = event.target.parentNode.dataset.cardId;
    event.target.checked ? (state = 'complete') : (state = 'incomplete');
    updateUrl = `https://api.trello.com/1/cards/${cardId}/checkItem/${itemId}?state=${state}&key=${key}&token=${token}`;
    let response = await put(updateUrl);
    // console.log(response);
    if (response.state === 'complete') {
      document.querySelector(`[data-id = a${response.id}]`).className = 'checkItemsChecked';
    } else {
      document.querySelector(`[data-id = a${response.id}]`).className = 'checkItemsUnchecked';
    }
  }
}

//-------------------------------------------------------------------------------------------------------
async function remove(event) {
  if (event.target.nodeName.toLowerCase() === 'span') {
    const itemId = event.target.parentNode.dataset.id.slice(1);
    deleteUrl = `https://api.trello.com/1/cards/${event.target.parentNode.dataset.cardId}/checkItem/${itemId}?key=${key}&token=${token}`;
    await del(deleteUrl);
    document.querySelector(`[data-id = ${event.target.parentNode.dataset.id}]`).remove();
  }
}

//-------------------------------------------------------------------------------------------------------
async function add(event) {
  event.stopPropagation();
  if (event.target.className === 'btn') {
    const addItem = document.createElement('p');
    addItem.innerHTML = '<input type=text>';
    addItem.addEventListener('keypress', async event => {
      if (event.which === 13 || event.keyCode === 13) {
        const value = event.target.value;
        console.log(event.target.parentNode);
        event.target.parentNode.parentNode.remove();
        const splitValues = value.split(' ');
        const name = splitValues.reduce((string, currVal, idx) => {
          (idx !== splitValues.length - 1) ? (string += `${currVal}%20`) : (string += currVal);
          return string;
        }, '');
        const defaultCheckListUrl = `https://api.trello.com/1/checklists/${defaultCheckListId}/checkItems?name=${name}&pos=bottom&checked=false&key=${key}&token=${token}`;
        const newCheckItem = await post(defaultCheckListUrl);
        const checkItemArray = [{
          cardId: defaultCardId,
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