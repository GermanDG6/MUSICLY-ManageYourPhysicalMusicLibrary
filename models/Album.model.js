const {Schema, model}= require('mongoose');

const albumSchema = new Schema({
    id: {type: String},
    title: {type: String, required: true},
    year: {type: String},
    formats:[{name: {type: String}}],
    artists: [{name: {type: String}}],
    tracklist: [{title:{type: String},duration:{type: String}}],
    images: [{uri: {type: String}}]
},
{
    versionKey: false
});

module.exports = model('Album', albumSchema)