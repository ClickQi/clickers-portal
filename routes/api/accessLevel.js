const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const AccessLevel = require('../../models/AccessLevel');

// @route    GET api/accesslevel
// @desc     Get all accessLevel
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const accessLevel = await AccessLevel.find();

    if (!accessLevel) {
      return res.status(200).json({ msg: 'There is no Access Level yet!' });
    }

    res.json(accessLevel);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/accesslevel
// @desc     Create or update accessLevel
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
      menuOption
    } = req.body;

    // Build accessLevel object
    let accessLevel = {};
    if (name) accessLevel.name = name;
    if (menuOption){
        accessLevel.menuOption = [];
        menuOption.forEach(element => {
            accessLevel.menuOption.push(element);
      });
    }

    try {
      if(req.body._id){
        let accessLevel = await AccessLevel.findOne({ _id: req.body._id });
  
        if (accessLevel) {
          // Update
          accessLevel = await AccessLevel.findOneAndUpdate(
            { _id: accessLevel.id},
            { $set: accessLevel },
            { new: true }
          );
  
          return res.json(accessLevel);
      }
      }

      // Create
      accessLevel = new AccessLevel(accessLevel);

      await accessLevel.save();
      res.json(accessLevel);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/accesslevel/:id
// @desc     Get accessLevel by id
// @access   Public
router.get('/:id', async (req, res) => {
    try {
        const accessLevel = await AccessLevel.findOne({
            _id: req.params.id
        });
    
        if (!accessLevel) return res.status(400).json({ msg: 'Access Level not found' });
    
        res.json(accessLevel);
      } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
          return res.status(400).json({ msg: 'Access Level not found' });
        }
        res.status(500).send('Server Error');
      }
});

// @route    DELETE api/accesslevel
// @desc     Delete accessLevel
// @access   Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove access level
    await AccessLevel.findOneAndRemove({ _id: req.body._id });

    res.json({ msg: 'Access Level deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/accesslevel/menuoption
// @desc     add or update menuoption
// @access   Private
router.put('/menuoption', auth, async (req, res) => {
  try {
    const accessLevel = await AccessLevel.findById({ _id: req.body.accessLevel.id });

    if(!accessLevel) {
      return res.status(404).json({ msg: 'Access Level not found' });
    }

    accessLevel.menuOption = req.body.accessLevel.menuOption;

    await accessLevel.save();

    res.status(200).json(accessLevel);
  } catch (error) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
