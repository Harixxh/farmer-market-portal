const mongoose=require('mongoose')
const UserSchema=mongoose.Schema({
    name:{
        type:String
    },
    email:{
         type:String,
         required:true,
         unique:true
    },
    password:{
        type:String,
        required:function() {
            return this.authProvider === 'local'
        }
    },
    role:{
        type:String,
        default:'farmer',
        enum:['farmer','admin','buyer']
    },
    googleId:{
        type:String,
        unique:true,
        sparse:true
    },
    profilePicture:{
        type:String
    },
    authProvider:{
        type:String,
        enum:['local','google'],
        default:'local'
    },
    blocked:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})
module.exports=mongoose.model('Users',UserSchema)