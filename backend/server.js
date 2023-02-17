const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');

//env vars
dotenv.config({ path: './config/config.env' });

connectDB();
// Route files
const bootcamps = require('./routes/bootcamps');

const app = express();

//middleware Dev logging

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//mount routers
app.use('/api/v1/bootcamps', bootcamps);

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
