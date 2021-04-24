require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');

//Importar los paquetes instalados para password
const bcrypt = require('bcrypt')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;

//Import model
const User = require('./models/User.model')

//----Configuracion DB
mongoose
  .connect('mongodb://localhost/backend-proyect2-rmt-ft-march21-germandg', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

//Middleware de checkForAuth
const checkForAuth = (req,res,next) => {
  if(req.isAuthenticated()){
    return next()
  }else{
    res.redirect('/login')
  }
}

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Configurar session
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true,
}))

//config serializer 
passport.serializeUser((user,callback)=>{
  callback(null, user._id)
})
//config deserializer
passport.deserializeUser((id,callback)=>{
  User.findById(id)
  .then((result) => {
    callback(null, result)
  })
  .catch((err) => {
    callback(err)
  });
})

//config flash middelware 
app.use(flash())

//Config Strategy (after flash)
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, (req, username, password, next )=>{
  User.findOne({username})
  .then((user) => {
    if(!user){
      return next(null, false, {message: 'Incorrect Username'});
    }

    if(!bcrypt.compareSync(password, user.password)){
      return next(null, false, {message: 'Incorrect Password'});
    }

    return next(null, user)
  })
  .catch((err) => {
    next(err);
  });
}));

//Config passport middelware (after config Strategy)
app.use(passport.initialize())
app.use(passport.session())

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));


//-----ROUTES
app.use('/', require('./routes/index.routes'));
app.use('/', require('./routes/auth.routes'));
app.use('/artist', require('./routes/artist.routes'));
app.use('/profile', require('./routes/profile.routes'));

module.exports = app;



app.listen(process.env.PORT || 3000, ()=>{
  console.log('conectado en el puerto 3000')
})