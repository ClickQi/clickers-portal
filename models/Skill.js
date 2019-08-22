const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    linkReference: [{
        name: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
    logSkill: [{
        idProfile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'profile'
        },
        level: {
            type: Number
        }
    }]
});

module.exports = Skill = mongoose.model('skill', SkillSchema);