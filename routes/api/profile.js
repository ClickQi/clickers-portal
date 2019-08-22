const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const EvaluationSkill = require('../../models/EvaluationSkill');
const Skill = require('../../models/Skill');

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('firstName', 'firstName is required')
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
      firstName,
      lastName,
      ocupation,
      picture,
      company,
      location,
      active,
      githubUsername,
      experience,
      education,
      social,
      profileSkill
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.profileSkill = [];
    profileFields.experience = [];
    profileFields.education = [];
    profileFields.social = [];

    profileFields.idUser = req.user.id;
    if (firstName) profileFields.firstName = firstName;
    if (lastName) profileFields.lastName = lastName;
    if (ocupation) profileFields.ocupation = ocupation;
    if (picture) profileFields.picture = picture;
    if (company) profileFields.company = company;
    if (location) profileFields.location = location;
    if (active) profileFields.active = active;
    if (githubUsername) profileFields.githubUsername = githubUsername;
    if (profileSkill) {
      profileSkill.forEach(element => {
        profileFields.profileSkill.push(element);
      });
    }
    if(experience) {
      experience.forEach(element => {
        profileFields.experience.push(element);
      });
    }
    if(education) {
      education.forEach(element => {
        profileFields.education.push(element);
      });
    }
    if(social) {
      social.forEach(element => {
        profileFields.social.push(element);
      });
    }

    try {
      let profile = await Profile.findOne({ idUser: req.user.id });

      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { idUser: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      // Create
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// // @route    GET api/profile/user/:user_id
// // @desc     Get profile by user ID
// // @access   Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      idUser: req.params.user_id
    }).populate('user', ['name', 'avatar']);

    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

// // @route    DELETE api/profile/:profile_id
// // @desc     Delete profile, user & posts
// // @access   Private
router.delete('/:profile_id', auth, async (req, res) => {
  try {
    // Remove evaluations
    await EvaluationSkill.deleteMany({ idProfile: req.params.profile_id });

    // Remove skill log of this profile
    await Skill.updateMany({ 'logSkill.idProfile': req.params.profile_id },
    { $pull: { logSkill: {idProfile: req.params.profile_id }}},
    {multi: true});

    // Remove profile
    await Profile.findOneAndRemove({ _id: req.params.profile_id });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// // @route    PUT api/profile/experience
// // @desc     Add profile experience
// // @access   Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
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
      title,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ idUser: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// // @route    DELETE api/profile/experience/:exp_id
// // @desc     Delete experience from profile
// // @access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ idUser: req.user.id });

    // Get remove index
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// // @route    PUT api/profile/education
// // @desc     Add profile education
// // @access   Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('from', 'From date is required')
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
      title,
      school,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      title,
      school,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ idUser: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// // @route    DELETE api/profile/education/:edu_id
// // @desc     Delete education from profile
// // @access   Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ idUser: req.user.id });

    // Get remove index
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// // @route    GET api/profile/github/:username
// // @desc     Get user repos from Github
// // @access   Public
router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found' });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
