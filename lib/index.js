"use strict";

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const fetch = require('node-fetch');
// let config = fetch('./config.js');
let trello = fetch('./trello');
// import trello from './trello';
const listsUrl = 'https://api.trello.com/1/boards/1DOPhXcj/lists?key=' + _config.default.key + '&token=' + _config.default.token;
trello.getId(listsUrl, 'Project 4').then(listId => trello.getCards(listId, _config.default.key, _config.default.token)).then(cards => trello.getAllChecklistsIds(cards)).then(checkListIds => trello.getAllCheckItems(checkListIds, _config.default.key, _config.default.token)).catch(error => console.log(error));