"use strict";

// const fetch = require('node-fetch');
let get = function (url) {
  return fetch(url).then(response => response.json());
};

module.exports.get = get;

module.exports.getId = async function (url, name) {
  let jsonData = await get(url);
  let id = jsonData.reduce((acc, currVal) => {
    if (currVal.name === name) {
      acc = currVal.id;
    }

    return acc;
  }, ''); // console.log(id);

  return id;
};

module.exports.getCards = async function (listId, key, token) {
  let listUrl = 'https://api.trello.com/1/lists/' + listId + '/cards?key=' + key + '&token=' + token;
  let cards = await get(listUrl); // console.log(cardsJsonData)

  return cards;
};

module.exports.getAllChecklistsIds = function (cardsJsonData) {
  let checklistIds = cardsJsonData.reduce((acc, currVal) => {
    acc.push(...currVal.idChecklists);
    return acc;
  }, []);
  return checklistIds;
};

function getCheckItems(checklistId, key, token) {
  let checkListUrl = `https://api.trello.com/1/checklists/${checklistId}/checkItems?key=${key}&token=${token}`;
  return get(checkListUrl);
}

module.exports.getAllCheckItems = async function (checklistIds, key, token) {
  let promiseArray = [];

  for (let i = 0; i < checklistIds.length; i++) {
    promiseArray[i] = getCheckItems(checklistIds[i], key, token);
  } // console.log(promiseArray);


  let checkItemsArray = await Promise.all(promiseArray).then(promises => {
    return spreadItems(promises);
  }).catch(error => console.log('Promise.all not resolving', error));
  console.log(checkItemsArray);
};

function spreadItems(nestedData) {
  let result = nestedData.reduce((checkItems, currCheckList) => {
    // let checkItemsOfOneList = [];
    currCheckList.forEach(element => {
      let checkItem = {
        name: element.name,
        state: element.state
      };
      checkItems.push(checkItem);
    }); // checkItems.push(checkItemsOfOneList);

    return checkItems;
  }, []);
  return result;
}