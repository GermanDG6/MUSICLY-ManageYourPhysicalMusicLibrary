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
          errorMessage: "All fields must be completed",
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

router.get('/album-details/',(req,res)=>{
  const layout = req.user ? "/layout/auth" : "/layout/noAuth";
  Album.findById({_id})
  .then((album) => {
    res.render("album-details", { albums: album, layout: layout });
  }).catch((err) => {
    res.render('error')
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
        lowest_price
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
            lowest_price
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
            lowest_price
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
                lowest_price
              }).then((album2) => {
                res.render("album-details", { albums: album2, layout: layout });
              });
            }
          });
        })
        .catch((err) => {
          res.render('error')
        });
    });
});

router.get('/own-album-details/:_id', checkForAuth,(req,res)=>{
  const layout = req.user ? '/layout/auth' : '/layout/noAuth'
  Album.findById(req.params._id)
  .then((result) => {
    res.render('album-details',{albums: result, layout:layout})
  })
  .catch((err) => {
    res.render('error')
  })
});

router.get('/create-album', checkForAuth,(req,res)=>{
  const layout = req.user? '/layout/auth' : '/layout/noAuth' 
  res.render('profile/createAlbum',{layout: layout})
})

router.post("/create-album", checkForAuth, (req, res) => {  
  const {title, year, images, formats, artists, tracklist} = req.body

  let imagesArr;
  if(Array.isArray(images)){
    imagesArr = images.map((elem) =>{
      return {uri: elem}
    })
  }else{
    imagesArr = [{uri: images}]
  }
  

  let formatsArr; 
  if(Array.isArray(formats)){
    formatsArr = formats.map((elem) =>{
      return {name: elem}
    })
  }else{
    formatsArr = [{name: formats}]
  }

  let artistsArr;
  if(Array.isArray(artists)){
    artistsArr = artists.map((elem)=>{
      return {name: elem}
    })
  }else{
    artistsArr = [{name: artists}]
  }

  let tracklistArr;
  if(Array.isArray(tracklist)){
   tracklistArr = tracklist.map((elem)=>{
      return {title: elem}
    })
  }else{
    tracklistArr = [{title: tracklist}]
  }

  let newAlbum = {title, year, images: imagesArr, formats: formatsArr, artists: artistsArr , tracklist: tracklistArr};

   Album.create(newAlbum)
    .then((album) => {
      User.findById(req.user._id)
      .populate('myList')
      .then((user) => {
        console.log(album._id)
        if (!user.myList.includes(album._id)) {
          User.findByIdAndUpdate(req.user._id, {
            $push: { myList: album },
          }).then(() => {
            res.redirect("/profile/my-list");
          });
        } else {
          res.redirect("/");
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
});


module.exports = router;