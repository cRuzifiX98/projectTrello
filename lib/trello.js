"use strict";

// const fetch = require('node-fetch');
let get = function (url) {
  return fetch(url).then(response => response.json());
}; // module.exports.get = get;


let getId = async function (url, name) {
  let jsonData = await get(url);
  let id = jsonData.reduce((acc, currVal) => {
    if (currVal.name === name) {
      acc = currVal.id;
    }

    return acc;
  }, '');
  return id;
}; // module.exports.getId = getId;


let getCards = async function (listId, key, token) {
  let listUrl = 'https://api.trello.com/1/lists/' + listId + '/cards?key=' + key + '&token=' + token;
  let cards = await get(listUrl);
  return cards;
}; // module.exports.getCards = getCards


let getAllChecklistsIds = function (cardsJsonData) {
  let checklistIds = cardsJsonData.reduce((acc, currVal) => {
    acc.push(...currVal.idChecklists);
    return acc;
  }, []);
  return checklistIds;
}; // module.exports.getAllChecklistsIds = getAllChecklistsIds;


function getCheckItems(checklistId, key, token) {
  let checkListUrl = `https://api.trello.com/1/checklists/${checklistId}/checkItems?key=${key}&token=${token}`;
  return get(checkListUrl);
}

let getAllCheckItems = async function (checklistIds, key, token) {
  let promiseArray = [];

  for (let i = 0; i < checklistIds.length; i++) {
    promiseArray[i] = getCheckItems(checklistIds[i], key, token);
  } // console.log(promiseArray);


  let checkItemsArray = await Promise.all(promiseArray).then(promises => {
    return spreadItems(promises);
  }).catch(error => console.log('Promise.all not resolving', error));
  console.log(checkItemsArray);
  return checkItemsArray; // let data= checkItemsArray.map(item=>item.name);
  // return getCheckData(data);
}; // module.exports.getAllCheckItems = getAllCheckItems;


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
} // function getCheckData(data){
// let item=`<li>${data}</li>`
//     return data.map(item=>document.getElementById('trello-items').append(item));
// }


let addItems = function (checkItemsArray) {
  checkItemsArray.forEach(element => {
    let li = `<li>${element.name}</li>`;
    document.body.appendChild(li);
  });
}; // module.exports.addItems = addItems;