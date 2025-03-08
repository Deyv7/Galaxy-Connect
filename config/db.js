import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Conectando ao MongoDB sem as opções obsoletas
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔥 MongoDB conectado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1); // Encerra o servidor em caso de erro
    }
};

export default connectDB;
