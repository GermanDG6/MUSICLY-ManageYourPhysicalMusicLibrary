const {Schema, model}= require('mongoose');

const albumSchema = new Schema({
    title: {type: String, requierd: true, createIndexes: true}
},
{
    versionKey: false
});

module.exports = model('Album', albumSchema)