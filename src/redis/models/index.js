module.exports = list => {
    return {
        async insert(key, value, dateExpiration){
            await list.set(key, value);
            if(dateExpiration) list.expireAt(key, dateExpiration);
        },
        async hasKey(key){
            const result = await list.exists(key);
            return result === 1;
        },
        async getValue(key){
            return await list.get(key);
        },
        async delete(key){
            return await list.del(key);
        },
        async getKeys(find){
            return await list.keys(find);
        }
    }
}