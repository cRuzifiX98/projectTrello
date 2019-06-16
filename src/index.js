const fetch = require('node-fetch');
let config = require('./config');
let trello = require('./trello');

const listsUrl = 'https://api.trello.com/1/boards/1DOPhXcj/lists?key=' + config.key + '&token=' + config.token;

trello.getId(listsUrl, 'Test Logs')
.then(listId => trello.getCards(listId, config.key, config.token))
.then(cardsJsonData => )


