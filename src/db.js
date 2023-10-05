const { Client } = require('pg');

let client;

async function initialize({ dbConnectionString, dbName }) {
  const connectionString = dbName ? dbConnectionString.replace(/\/?$/, `/${dbName}`) : dbConnectionString;

  client = new Client({
    connectionString
  });

  await client.connect();
}

module.exports = {
  get client() {
    return client;
  },
  get dbName() {
    return client.connectionParameters.database;
  },
  initialize,
};
