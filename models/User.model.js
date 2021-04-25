const {Schema, model}= require('mongoose');

const userSchema = new Schema({
    username: {type: String, requierd: true, createIndexes: true},
    password: {type: String, required: true},
    myList: [{type: Schema.Types.ObjectId, ref: `Album`}],
    wishList:[{type: Schema.Types.ObjectId, ref: `Album`}],
    salesList: [{type: Schema.Types.ObjectId, ref: `Album`}]
},
{
    versionKey: false,
});

module.exports = model('User', userSchema)