const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
//env vars
dotenv.config({ path: './config/config.env' });

connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');

const app = express();

//body parser
app.use(express.json());

//cookie parser
app.use(cookieParser());

//middleware Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//file uploading
app.use(fileupload());

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth',auth);

app.use(errorHandler);


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
