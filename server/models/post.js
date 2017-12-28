var mongoose = require('mongoose');

var PostSchema =  new mongoose.Schema({
    title : {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    excerpt: {
        type: String,
        required: false,
        maxlength: 200,
        trim: true
    },
    thumbnail_url: {
        type: String,
        required: true,
        minlength: 3

    },
    type: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    body: {
        type: String,
        required: true,
        maxlength: 10000,
        minlength: 1,
        trim: false
    },
    offset: {
        type: Number
    },
    date_expire: {
        type: Number
    },
    events: [{
        event_id : {
            type: String
        }
    }]
});


PostSchema.static.findByEventArray = function(eventIdArray) {

    let Post = this;
    var orObjects = [];
    eventIdArray.forEach(event_id => {
        orObjects.push({events: {event_id}});
    });
    // loop through id array and create or_params
    return Post.find({ $or: orObjects});
}

var Post = mongoose.model('Post', PostSchema);

module.exports = {Post}; 