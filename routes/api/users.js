const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const User = require('../../models/User');

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/',
  [
    check('email', 'Please inform a email from the domain clickqi.com.br').exists().custom(val => {
      if(val.indexOf('@clickqi.com.br') !== - 1)
        return true;
        return false;
    }),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, idAccessLevel } = req.body;
    // let data;
    // let session_url = 'http://teamwork.clickqi.com.br/people.json';
    // let username = 'luis.eduardo@clickqi.com.br';
    // let teamPassword = 'pa$$w0rd827';
    // let basicAuth = 'Basic ' + new  Buffer.from(username + ':' + teamPassword).toString('base64');

    // axios.get(session_url, {
    //   header: {
    //     'Authorization': 'Basic bHVpcy5lZHVhcmRvQGNsaWNrcWkuY29tLmJyIDogcGEkJHcwcmQ4Mjc=',
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json'
    //   }
    // })
    //   .then(response => {
    //     data = response;
    //   })
    //   .catch(error => {
    //     console.log('error', error.response.statusText);
    //   });

    // var auth = tw.authenticate();
    // var people = tw.people.get({
    //   page: 2,
    //   pageSize: 50
    // });

    // console.log('pessoas ',people);
    // console.log(auth);

    try {
      let user = await User.findOne({ email: email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        email,
        password,
        idAccessLevel
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      const data = await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          return res.json({ token });
        }
      );

      res.json(data);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    PUT api/users/accesslevel/:user_id
// @desc     add or update accesslevel
// @access   Private
router.put('/accesslevel/:user_id',
  auth,
  async (req, res) => { 
    const { accessLevel } = req.body;

    try {
      let user = await User.findOne({ _id: req.params.user_id });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User not found' }] });
      }

      await User.updateOne({ _id: req.params.user_id }, { $set: { idAccessLevel: accessLevel}})

      res.status(200).send('Access Level changed');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

module.exports = router;
