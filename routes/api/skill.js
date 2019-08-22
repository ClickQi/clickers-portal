const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Skill = require('./../../models/Skill');
const Profile = require('./../../models/Profile');

// @route    GET api/skill
// @desc     Get all skills
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const skills = await Skill.find();

    if (!skills) {
      return res.status(200).json({ msg: 'There is no skill yet!' });
    }

    res.json(skills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/skill
// @desc     Create or update skill
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      linkReference
    } = req.body;

    // Build skill object
    const skillFields = {};
    if (name) skillFields.name = name;
    if (description) skillFields.description = description;
    if (linkReference){
        skillFields.linkReference = [];
        linkReference.forEach(element => {
            skillFields.linkReference.push(element);
      });
    }

    try {
      let skill = await Skill.findOne({ name: req.body.name });

      if (skill) {
        // Update
        skill = await Skill.findOneAndUpdate(
          { _id: skill._id},
          { $set: skillFields },
          { new: true }
        );

        return res.json(skill);
      }

      // Create
      skill = new Skill(skillFields);

      await skill.save();
      res.json(skill);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/skill/:id
// @desc     Get skill by id
// @access   Public
router.get('/:id', async (req, res) => {
    try {
        const skill = await Skill.findOne({
          _id: req.params.id
        });
    
        if (!skill) return res.status(400).json({ msg: 'Skill not found' });
    
        res.json(skill);
      } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
          return res.status(400).json({ msg: 'Skill not found' });
        }
        res.status(500).send('Server Error');
      }
});

// @route    DELETE api/skill/:id
// @desc     Delete skill
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Remove skill
    await Skill.findOneAndRemove({ _id: req.params.id });

    res.json({ msg: 'Skill deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/skill/log/:skill_id
// @desc     Add skill log
// @access   Private
router.put(
  '/log/:skill_id',
  [
    auth,
    [
      check('level', 'Level is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      idProfile,
      level
    } = req.body;

    const newLog = {
      idProfile,
      level
    };

    try {
      const skill = await Skill.findOne({ _id: req.params.skill_id });

      skill.logSkill.unshift(newLog);

      await skill.save();

      res.json(skill);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
