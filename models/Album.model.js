const {Schema, model}= require('mongoose');

const albumSchema = new Schema({
    id: {type: String},
    title: {type: String, required: true},
    year: {type: String},
    formats:[{name: {type: String}}],
    artists: [{name: {type: String}}],
    tracklist: [{title:{type: String},duration:{type: String}}],
    images: [{uri: {type: String, default:'https://cipapurimac.org.pe/wp-content/plugins/gallery-album/assets/img/albom-empoty.jpg'}}]
},
{
    versionKey: false
});

module.exports = model('Album', albumSchema)