const mongoose = require('mongoose');

const EvaluationSkillSchema = new mongoose.Schema({
   idUser: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'user'
   },
   idProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profile'
   },
   skill: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'skill'
   },
   level: {
       type: Number,
       required: true
   }
});

module.exports = EvaluationSkill = mongoose.model('evaluationSkill', EvaluationSkillSchema);