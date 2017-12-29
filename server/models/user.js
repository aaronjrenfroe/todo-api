
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  privleges: {
    type: String,
    require: true,
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
}, /* Options*/ {usePushEach : true});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();
  return _.pick(userObject, ['_id', 'email', 'privleges']);
};

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens.push ({access, token});

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function(token) {
  var user = this;
  console.log(token);
  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};

UserSchema.pre('save', function (next) {
  let user = this;
  if(user.isModified('password')){
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash
        next();
      });
  });
  }else{
    next();
  }
});


UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
    console.log(decoded);

  }catch (err){
    return Promise.reject();
  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token' : token,
    'tokens.access' : decoded.access
  })

}


UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;
  return User.findOne({email}).then((user) => {
    if(!user){
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res){
          resolve(user);
        }else{
          reject();
        }
      });
    });

  });
  
  // var decoded;

  // try {
  //   decoded = jwt.verify(token, 'abc123');
  // }catch (err){
  //   return Promise.reject();
  // }
  // return User.findOne({
  //   '_id': decoded._id,
  //   'tokens.token' : token,
  //   'tokens.access' : decoded.access
  // })

}



var User = mongoose.model('User', UserSchema);

module.exports = {User}
