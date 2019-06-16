const fetch = require('node-fetch');

let get = function(url) {
    return new Promise((resolve, reject) => {
        let data = fetch(url).then(response => response.json());
        resolve(data);
    })
}
module.exports.get = get;

module.exports.getId = async function (url, name) {
    let jsonData = await get(url);
    let id = jsonData.reduce((acc, currVal) => {
        if (currVal.name === name) {
            acc = currVal.id;
        }
        return acc;
    }, '');
    return id;
}

module.exports.getCards = async function (listId, key, token) {
    let listUrl = 'https://api.trello.com/1/lists/' + listId + '/cards?key=' + key + '&token=' + token;
    let cardsJsonData = await get(listUrl);
    console.log(js)
    return cardsJsonData;
}

// module.exports.getAllChecklistItems = function(cardsJsonData) {

}