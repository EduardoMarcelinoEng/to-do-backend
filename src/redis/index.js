const { createClient } = require('redis');
const models = require('./models');

const blockListClient = createClient({
    prefix:'blocklist:'
});
const allowListClient = createClient({
    prefix:'allowlist:'
});

blockListClient.on('error', (err) => console.log('Redis BlockListClient Error', err));
allowListClient.on('error', (err) => console.log('Redis AllowListClient Error', err));

blockListClient.connect();
allowListClient.connect();

module.exports = {
    blockListClient,
    allowListClient,
    modelsList: models
}
