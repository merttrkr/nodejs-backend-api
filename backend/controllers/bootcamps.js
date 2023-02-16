
//  @desc       get all bootcamps
//  @route      GET /api/v1/bootcamps
//  @access     Public
exports.getBootcamps = (req,res,next)=> {
    res.status(200).json({ success: true, msg: 'show all bootcamps', hello: req.hello});
}

//  @desc       get bootcamp
//  @route      GET /api/v1/bootcamps:/id
//  @access     Public
exports.getBootcamp = (req,res,next)=> {
    res.status(200).json({ success: true, msg: `get bootcamp ${req.params.id}` });
}

//  @desc       create new bootcamp
//  @route      POST /api/v1/bootcamps
//  @access     Private
exports.createBootcamps = (req,res,next)=> {
    res.status(200).json({ success: true, msg: 'create new bootcamp'});
}

//  @desc       Update bootcamp
//  @route      PUT /api/v1/bootcamps:/id
//  @access     Private
exports.updateBootcamps = (req,res,next)=> {
    res.status(200).json({ success: true, msg: `update bootcamp ${req.params.id}` });
}

//  @desc       delete bootcamp
//  @route      DELETE /api/v1/bootcamps:/id
//  @access     Private
exports.deleteBootcamps = (req,res,next)=> {
    res.status(200).json({ success: true, msg: `delete bootcamp ${req.params.id}` });
}