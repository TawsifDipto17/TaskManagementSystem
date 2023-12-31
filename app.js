require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');

const {flash} = require('express-flash-message');
const session = require('express-session');
const connectDB = require('./server/config/db');
const taskController = require('./server/controllers/taskController');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const port = 3000;

// Connect to Database
connectDB();

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(methodOverride('_method'));
//static files
app.use(express.static('public'));

// EXPRESS SESSION
app.use(
    session({
        secret : 'secret',
        resave : false,
        saveUninitialized : true,
        cookie : {
            maxAge : 1000 * 60 * 60 * 24 * 7 // 1 week
        }
    })
)

// FLASH MESSAGES
app.use(flash({ sessionKeyName : 'flashMessage' }));



// templating engine

app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Routes

app.use('/', require('./server/routes/task'));
app.use('/auth', require('./server/routes/task'));

app.get('*', (req,res)=>{
    res.status(404).render('404');
});

app.listen(port, ()=>{
    console.log(`app is listening on port ${port}`);
})
