const {Schema, model}= require('mongoose');

const userSchema = new Schema({
    username: {type: String, requierd: true, createIndexes: true},
    password: {type: String, required: true},
    myMusicList: [Object],
    wishList:[Object],
    salesList: [Object]
},
{
    versionKey: false,
});

module.exports = model('User', userSchema)