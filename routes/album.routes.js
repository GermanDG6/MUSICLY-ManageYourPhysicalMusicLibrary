const express = require('express');
const router = express.Router();
const axios = require('axios');
const Album = require('../models/Album.model');
const User = require('../models/User.model');
//Middleware de checkForAuth
const checkForAuth = (req,res,next) => {
  if(req.isAuthenticated()){
    return next()
  }else{
    res.redirect('/login')
  }
};


router.get('/search',(req,res)=>{      
  const layout = req.user? '/layout/auth' : '/layout/noAuth'    
  res.render('search',{layout})
})

router.get('/all-albums',(req,res)=>{
  axios.get(`https://api.discogs.com/database/search?artist=${req.query.artist}&key=${process.env.CONSUMERKEY}&secret=${process.env.CONSUMERSECRET}`)
  .then((result) => {
      const layout = req.user? '/layout/auth' : '/layout/noAuth'
      if (req.query.artist === "" ) {
        const layout = req.user ? '/layout/auth' : '/layout/noAuth'
        res.render("search", {
          errorMessage: "Todos los campos deben estar rellenos",
          layout: layout
        })
        return
      }else{
        res.render('search',{album: result.data.results, layout:layout})
      }
  })
  .catch((err) => {
    console.log(err)
  });
})

router.get("/album-details/:id", (req, res) => {
  const id = req.params.id;
  const layout = req.user ? "/layout/auth" : "/layout/noAuth";
  axios.get(`https://api.discogs.com/masters/${id}?key=${process.env.CONSUMERKEY}&secret=${process.env.CONSUMERSECRET}`)
    .then((result) => {
      const {
        id,
        title,
        year,
        formats,
        tracklist,
        artists,
        images,
      } = result.data;
      Album.findOne({ id })
      .then((album) => {
        if (album) {
          res.render("album-details", { albums: album, layout: layout });
        } else {
          Album.create({
            id,
            title,
            year,
            formats,
            artists,
            tracklist,
            images,
          })
          .then((album2) => {
            res.render("album-details", { albums: album2, layout: layout });
          });
        }
      });
    })
    .catch((err) => {
      axios.get(`https://api.discogs.com/releases/${id}?key=${process.env.CONSUMERKEY}&secret=${process.env.CONSUMERSECRET}`)
        .then((result) => {
          const {
            id,
            title,
            year,
            formats,
            tracklist,
            artists,
            images,
          } = result.data;
          Album.findOne({ id })
          .then((album) => {
            if (album) {
              res.render("album-details", { albums: album, layout: layout });
            } else {
              Album.create({
                id,
                title,
                year,
                formats,
                artists,
                images,
                tracklist,
              }).then((album2) => {
                res.render("album-details", { albums: album2, layout: layout });
              });
            }
          });
        })
        .catch((err) => {
          console.log(err);
        });
    });
});

router.get('/create-album', checkForAuth,(req,res)=>{
  res.render('profile/createAlbum')
})

router.post("/create-album", checkForAuth, (req, res) => {
  console.log(req.body)
  
  Album.create(req.body)
    .then((result) => {
      User.findById(req.user._id)
      .then((result) => {
        if (!result.myList.includes(req.body)) {
          User.findByIdAndUpdate(req.user._id, {$push: { myList: req.body }})
          .then((result) => {
            res.redirect("/profile/my-list");
          });
        } else {
          res.redirect("/profile/my-list");
        }
      });
    })
    .catch((err) => {
      console.log(err)
    });
});

module.exports = router;