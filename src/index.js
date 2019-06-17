const fetch = require('node-fetch');

let config = fetch('./config.js');
let trello = fetch('./trello');
//  import config from './config';
// import trello from './trello';

const listsUrl = 'https://api.trello.com/1/boards/1DOPhXcj/lists?key=' + config.key + '&token=' + config.token;

trello.getId(listsUrl, 'Project 4')
.then(listId => trello.getCards(listId, config.key, config.token))
.then(cards => trello.getAllChecklistsIds(cards))
.then(checkListIds => trello.getAllCheckItems(checkListIds, config.key, config.token))
.catch(error => console.log(error))

