exports.userSignupValidator=(req,res,next)=>{
    req.check('name','Name is Required').notEmpty();
    req.check('email','Email must be between 6 to 32 character')    
            .matches(/.+\@.+\..+/)
            .withMessage('Invalid Email ID')
            .isLength({
                    min:4,
                    max:32
            })
    req.check('password','Password is mandatory').notEmpty();
    req.check('password')
            .isLength({min:6})
            .withMessage('Password must contain 6 characters')
            .matches(/\d/)
            .withMessage('Password must contain a number')
            
    const errors = req.validationErrors();
    if(errors){
        const firstErr = errors.map(error=>error.msg)[0];
        return res.status(400).json({Error : firstErr});
    }
    next();
};