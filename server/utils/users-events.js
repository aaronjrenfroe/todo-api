const axios = require('axios');

var GetEvents = (id, token) => {
  let url = 'https://api.mycircuitree.com/FH/Exports/ExecuteQuery.json';
  //let token = 'C-rfuf3c/DjFYjAAEkPVqRAdxrxFBvFOmNRicxLQDBoZPUgZ6XJokrsEuW1knO0M9xRmacxonJ//nBffDCe4HiIQTomnKu1vBO';
  let params = [{ParameterID : 43, ParameterValue : id}];
  let settings = {
    ApiToken: token,
    ExportQueryID: 242,
    QueryParameters: params 
  }
  console.log(JSON.stringify(settings, null, 2));
  return axios.post(url, settings);
}

module.exports = {GetEvents};