import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'E-mail inválido']
},
  password: {
    type: String,
    required: true
  }
});

const Users = mongoose.model('User', userSchema);

export default Users;