const mongoose = require('mongoose');
const crypto = require('crypto');
const uuidv1 = require('uuid/v1');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        trim: true,
        required : true,
        maxlength : 32
    },
    email:{
        type : String,
        trim : true,
        required : true,
        unique : true
    },
    cryptpassword:{
        type: String,
        required: true
    },
    about :{
        type: String,
        trim:true
    },
    salt:String,
    role:
    {
        type:Number,
        default :0
    },
    histroy:{
        type: Array,
        default : []
    }

},
{timestamps:true}
);

userSchema
    .virtual("password")
    .set(function(pass){
        this._pass = pass;
        this.salt = uuidv1(); 
        this.cryptpassword = this.encyptedPassword(pass);
    })
    .get(function(){
        return this._pass;
    });

userSchema.methods = {


    authenticate : function(plainText){
        
        console.log(`plainText::${this.salt}`);
        return this.encyptedPassword(plainText) === this.cryptpassword;

    },

    encyptedPassword : function(pass){
        console.log(uuidv1()); 
        if(!pass) return '';
        try{
            return crypto.createHmac('sha1',this.salt)
                            .update(pass)
                            .digest('hex')
        }catch(err)
        {       
            console.log(err);
            return "";
        }
    }
};


module.exports = mongoose.model("User",userSchema);
