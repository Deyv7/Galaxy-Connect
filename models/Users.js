import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // Remove espaços extras
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Transforma em minúsculas
    match: [/\S+@\S+\.\S+/, 'E-mail inválido'] // Validação simples de e-mail
  },
  password: {
    type: String,
    required: true,
    minlength: 8 // Exige pelo menos 8 caracteres
  }
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

// Hash da senha antes de salvar no banco
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Users = mongoose.model('User', userSchema);

export default Users;
