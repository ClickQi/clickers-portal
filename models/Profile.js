const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  ocupation: {
    type: String
  },
  picture: {
    type: String
  },
  company: {
    type: String
  },
  location: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  },
  githubUsername: {
    type: String
  },
  experience: [
    {
      title: {
        type: String,
        required: true
      },
      from: {
        type: Date,
        required: true
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      }
    }
  ],
  education: [
    {
      title: {
        type: String,
        required: true
      },
      school: {
        type: String,
        required: true
      },
      from: {
        type: Date,
        required: true
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      }
    }
  ],
  social: [
    {
      title: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }
  ],
  profileSkill: [
    {
      idSkill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'skill'
      },
      url: {
        type: String
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
