const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const EvaluationSkill = require('../../models/EvaluationSkill');

// @route    GET api/evaluationskill
// @desc     Get all evaluationskill
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const evaluationSkill = await EvaluationSkill.find();

    if (!evaluationSkill) {
      return res.status(200).json({ msg: 'There is no Evaluation skill yet!' });
    }

    res.json(evaluationSkill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/evaluationskill
// @desc     Create or update evaluationskill
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('evaluationSkill.idProfile', 'idProfile is required')
        .not()
        .isEmpty(),
      check('evaluationSkill.level', 'level is required').not().isEmpty(),
      check('evaluationSkill.skill', 'skill is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      idProfile,
      level,
      skill
    } = req.body.evaluationSkill;

    // Build accessLevel object
    let evaluationSkill = {};
    evaluationSkill.idUser = req.user.id;
    if (idProfile) evaluationSkill.idProfile = idProfile;
    if (skill) evaluationSkill.skill = skill;
    if (level) evaluationSkill.level = level;

    try {
        if(req.body.evaluationSkill._id) {     
            evaluationSkill = await EvaluationSkill.findOneAndUpdate(
              { _id: req.body.evaluationSkill._id },
              { $set: evaluationSkill },
              { new: true }
            );
    
            return res.json(evaluationSkill);
        }
    
      // Create
      evaluationSkill = new EvaluationSkill(evaluationSkill);

      await evaluationSkill.save();
      res.json(evaluationSkill);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/evaluationskill/:id
// @desc     Get evaluationskill by id
// @access   Public
router.get('/:id', async (req, res) => {
    try {
        const evaluationSkill = await EvaluationSkill.findOne({
            _id: req.params.id
        });
    
        if (!evaluationSkill) return res.status(400).json({ msg: 'Evaluation Skill not found' });
    
        res.json(evaluationSkill);
      } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
          return res.status(400).json({ msg: 'Evaluation Skill not found' });
        }
        res.status(500).send('Server Error');
      }
});

module.exports = router;
