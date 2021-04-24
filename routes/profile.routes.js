const express = require('express');
const router = express.Router();


const User = require('../models/User.model');

//Middleware de checkForAuth
const checkForAuth = (req,res,next) => {
  if(req.isAuthenticated()){
    return next()
  }else{
    res.redirect('/login')
  }
};




router.get('/', checkForAuth,(req,res,next)=>{
  const layout = req.user? '/layout/auth' : '/layout/noAuth'
  //console.log(req.user)
  res.render('profile/profile', {dataUser: req.user, layout:layout})
});

router.post('/wish-list', checkForAuth, (req,res,next)=>{
  User.findByIdAndUpdate(req.user , {$push: {wishList: req.body}})
  .then((result) => {
    res.redirect('/profile')
  }).catch((err) => {
    console.log(err)
  });
})



module.exports = router;