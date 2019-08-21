const mongoose = require('mongoose');

const menuOptionSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true
    },
    idMenuOptionFather: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'menuOption'
    }
});

module.exports = MenuOption = mongoose.model('menuOption', menuOptionSchema);