const express = require('express');
const router = express.Router();
const axios = require('axios');



router.get('/search',(req,res)=>{      
  const layout = req.user? '/layout/auth' : '/layout/noAuth'    
  res.render('search',{layout})
})

router.get('/all-albums',(req,res)=>{
  axios.get(`https://api.discogs.com/database/search?artist=${req.query.artist}&key=${process.env.CONSUMERKEY}&secret=${process.env.CONSUMERSECRET}`)
  .then((result) => {
      const layout = req.user? '/layout/auth' : '/layout/noAuth'
      res.render('all-albums',{album: result.data.results, layout:layout})
    }).catch((err) => {
      console.log(err)
    });
})

router.get('/album-details/:id',(req,res)=>{
  const id = req.params.id
  axios.get(`https://api.discogs.com/releases/${id}?key=${process.env.CONSUMERKEY}&secret=${process.env.CONSUMERSECRET}`)
  .then((result) => {
    console.log(result.data.images[0].uri)
    const layout = req.user? '/layout/auth' : '/layout/noAuth'
    res.render('album-details',{ album: result.data, layout:layout})
  }).catch((err) => {
    console.log(err)
  });
})




// router.get('/album-details', (req,res,next)=>{
//      axios.get(`https://api.discogs.com/database/search?title=${req.query.title}&key=${process.env.CONSUMERKEY}&secret=${process.env.CONSUMERSECRET}`)
//      .then((result) => {
//        console.log(result)
//       const layout = req.user? '/layout/auth' : '/layout/noAuth'
//       res.render('album-details',{ album: result.results, layout:layout})
//     }).catch((err) => {
//       console.log(err)
//     });
// })

module.exports = router;