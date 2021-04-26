const express = require('express');
const Album = require('../models/Album.model');
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



router.get('/my-list', checkForAuth ,(req, res) => {
  const layout = req.user ? '/layout/auth' : '/layout/noAuth'
  User.findById(req.user._id)
  .populate('myList')
  //.populate('artists')
  .then((result) => {
      res.render('profile/myList', {user: result , layout: layout})
  }).catch((err) => {
    console.log(err)
  });
})

router.post('/my-list/:_id', checkForAuth,(req,res,next)=>{
  User.findById(req.user._id)
  .then((result) => {
    if(!result.myList.includes(req.params._id)){
      User.findByIdAndUpdate(req.user._id, {$push: {myList: req.params._id}})
        .then((result) => {
          res.redirect('/profile/my-list')
        })
    }else{
      res.redirect('/profile/my-list')
    }
  })
  .catch((err) => {
    console.log(err)
  });
});

router.post('/my-list/:_id/delete', checkForAuth,(req,res)=>{
  User.findByIdAndUpdate(req.user._id, {$pull: {myList: req.params._id}})
  .then((result) => {
      res.redirect('/profile/my-list')
    })
    .catch((err) => {
      console.log(err)
    });
})





router.get('/wish-list', checkForAuth ,(req, res) => {
  const layout = req.user ? '/layout/auth' : '/layout/noAuth'
  User.findById(req.user._id)
  .populate('wishList')
  .then((result) => {
    res.render('profile/wishList', {user: result , layout: layout})
  }).catch((err) => {
    console.log(err)
  });
})

router.post('/wish-list/:_id', checkForAuth, (req,res,next)=>{
  User.findById(req.user._id)
  .then((result) => {
    if(!result.wishList.includes(req.params._id) && !result.myList.includes(req.params._id)){
      User.findByIdAndUpdate(req.user._id , {$push: {wishList: req.params._id}})
      .then((result) => {
        res.redirect('/profile/wish-list')
      })
    }else{
      res.redirect('/profile/wish-list')
    }
  })
  .catch((err) => {
    console.log(err)
  });
})



module.exports = router;