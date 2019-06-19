// const fetch = require('node-fetch');

let key = 'a71a2a6e920d2c4de0ff6a3c977dfbca';
let token = 'fcb04beb183631337d2659876641a6c88482102930147d398e30b87b9f1d9003';

// let config = fetch('./config.js');
let trello = fetch('./trello');
// let config = require('./config.js');
// let trello = require('./trello');

const listsUrl = 'https://api.trello.com/1/boards/1DOPhXcj/lists?key=' + key + '&token=' + token;

trello.getId(listsUrl, 'Project 4')
.then(listId => trello.getCards(listId, key, token))
.then(cards => trello.getAllChecklistsIds(cards))
.then(checkListData => trello.getAllCheckItems(checkListData, key, token))
// .then(checkItemsArray => trello.)
.catch(error => console.log(error))

console.log(key);
