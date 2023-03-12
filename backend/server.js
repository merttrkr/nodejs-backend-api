const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const fastifyCors = require('fastify')

//env vars
dotenv.config({ path: './config/config.env' });

connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();


//body parser
app.use(express.json());

//cookie parser
app.use(cookieParser());

//middleware Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const corsOptions ={
  origin:'http://localhost:5173', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration

//file uploading
app.use(fileupload());

// sanitize data for nosql injection
app.use(mongoSanitize());

//set security headers
app.use(helmet());

//prevent XSS attack
app.use(xss());

//rate limiting
const limiter =rateLimit({
  windowMs: 10 * 60 * 1000, //10 mins
  max:100
});
app.use(limiter);

// prevent http param pollution
app.use(hpp()); 



//set static folder
app.use(express.static(path.join(__dirname, 'public')));



//mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth',auth);
app.use('/api/v1/users',users);
app.use('/api/v1/reviews',reviews);

app.use(errorHandler);

// var allowedOrigins = ['http://localhost:5173'];
// app.use(cors({
//   origin: function(origin, callback){
//     // allow requests with no origin 
//     // (like mobile apps or curl requests)
//     if(!origin) return callback(null, true);
//     if(allowedOrigins.indexOf(origin) === -1){
//       var msg = 'The CORS policy for this site does not ' +
//                 'allow access from the specified Origin.';
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   }
// }));

const PORT = process.env.PORT || 5000;

const server = app.listen(
                            PORT,
                            console.log(`server is running on port ${PORT}`));

//handle unhandled promise rejections
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    //close server and exit
    server.close(()=>process.exit(1));
});
