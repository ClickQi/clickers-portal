const mongoose = require('mongoose');

const accessLevelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    menuOption: [
        {
            idMenuOption: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'menuOption'
            }
        }
    ]
});

module.exports = AccessLevel = mongoose.model('accessLevel', accessLevelSchema);