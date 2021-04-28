const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

const User = require('../models/User.model');

router.get('/signup', (req,res)=>{
    const layout = req.user ? '/layout/auth' : '/layout/noAuth'
    res.render('auth/signup',{layout:layout})
});
router.post("/signup", (req, res) => {
  const { username, password } = req.body;
  if (username === "" || password === "") {
    const layout = req.user ? '/layout/auth' : '/layout/noAuth'
    res.render("auth/signup", {
      errorMessage: "All fields must be completed",
      layout: layout
    })
    return
  }else if(password.length<6){
    const layout = req.user ? '/layout/auth' : '/layout/noAuth'
    res.render("auth/signup", {
      errorMessage: "The password must be at least 6 digits long",
      layout: layout
    })
    return
  }
  User.findOne({ username })
    .then((user) => {
      if (user) {
        const layout = req.user ? '/layout/auth' : '/layout/noAuth'
        res.render("auth/signup", { 
          errorMessage: "This user already exists",
          layout: layout  
        });
      } else {
        const hashedPassword = bcrypt.hashSync(password, 10);
        User.create({ username, password: hashedPassword }).then((result) => {
          res.redirect("/login");
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/login",(req,res)=>{
    const layout= req.user ? 'layout/auth' : 'layout/noAuth'
    res.render('auth/login', {errorMessage: req.flash('error'), layout: layout})
})
router.post('/login', passport.authenticate('local',{
  successRedirect: '/album/search',
  failureRedirect: '/login',
  failureFlash: true,
  passReqToCallback: true
}))

router.get('/logout',(req,res)=>{
  req.logout()
  res.redirect('/login')
})


module.exports = router;