const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter an password'],
        minlength: [6, 'Minimum password length is 6 characters']
    }
});

//Função executada pós-registro no db
userSchema.post('save', function(doc, next){

    console.log('new user was created & saved', doc);
    next();
});

//Função executada pré-registro no db
//Criptografia de senha
userSchema.pre('save', async function(next){
    
    //Gera o salt
    const salt = await bcrypt.genSalt(); 

    //Aplica o hash concatenando o salt e o password
    this.password = await bcrypt.hash(this.password, salt); 

    next();
});


//Método de login
userSchema.statics.login = async function(email, password){
    
    //Verifica se o email existe dentro da base de dados
    const user = await this.findOne({ email });
    if(user){

        //Retorna true ou false para a comparação das senhas
        const auth = await bcrypt.compare(password, user.password);

        //Verifica se a senha está correta
        if(auth){
            return user;
        }
        throw Error('incorrect password');
    }
    //Seta o erro
    throw Error('incorrect email');
}

const User = mongoose.model('user', userSchema);
module.exports = User;