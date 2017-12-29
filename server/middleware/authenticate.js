var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
  var token = req.header('x-auth');
  
  User.findByToken(token).then((user) => {
    console.log(user._id);
    if(!user){
        return Promise.reject();
    }else{
        req.user = user;
        req.token = token;
        next();
    }
  }).catch((err) => {
      res.status(401).send()  
  });
};

module.exports = {authenticate};