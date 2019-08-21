const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const MenuOption = require('../../models/MenuOption');

// @route    GET api/menuoption
// @desc     Get all menuoptions
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const menuOption = await MenuOption.find();

    if (!menuOption) {
      return res.status(200).json({ msg: 'There is no menu options yet!' });
    }

    res.json(menuOption);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/menuoption/:id
// @desc     Get menuoption by id
// @access   Public
router.get('/:id', async (req, res) => {
    try {
        const menuOption = await MenuOption.findOne({
            _id: req.params.id
        });
    
        if (!menuOption) return res.status(400).json({ msg: 'Menu option not found' });
    
        res.json(menuOption);
      } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
          return res.status(400).json({ msg: 'Menu option not found' });
        }
        res.status(500).send('Server Error');
      }
});

// @route    POST api/menuOption
// @desc     Create or update menu option
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name of the menu option is required')
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
      idMenuOptionFather
    } = req.body;

    // Build profile object
    const menuFields = {};
    menuFields.name = name,
    menuFields.idMenuOptionFather = idMenuOptionFather
    

    try {

      if(req.menuOption) {
        let menuOption = await MenuOption.findOne({ menuOption: req.menuOption.id });
  
        if (menuOption) {
          // Update
          menuOption = await MenuOption.findOneAndUpdate(
            { user: req.user.idUser },
            { $set: menuFields },
            { new: true }
          );
  
          return res.json(menuOption);
        }
      }

      // Create
      menuOption = new MenuOption(menuFields);

      await menuOption.save();
      res.json(menuOption);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
  );

module.exports = router;
