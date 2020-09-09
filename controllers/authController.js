const userModel = require('../models/User');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//Manipulação de erros
const handleErrors = (err) => {

    console.log(err.message, err.code);
    let errors = { email: '', password: ''};

    //Email já existe
    if(err.code === 11000){
        errors.email = 'The email field should be unique. That email is already registered';
        return errors;
    }

    //Validação de erros
    if(err.message.includes('user validation failed')){

        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }

    if(err.message === 'incorrect email'){
        errors.email = 'That email is not registered';
    }

    if(err.message === 'incorrect password'){
        errors.password = 'That password is incorrect';
    }

    return errors;
}

//Criação dos tokens
const maxAge = 3 * 24 * 60 * 60; //3 dias em segundos
const createToken = (id) => {

    return jwt.sign({ id }, 'net ninja secret', {
        expiresIn: maxAge
    });

}

//Requests de cadastro
module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.signup_post = async (req, res) => {

    const { email, password } = req.body;

    try {

        const user = await userModel.create({ email, password });

        //Cria o token para logar o usuário
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

        //Retorna os status e os dados
        res.status(201).json({ user: user._id });

    } catch (error) {

        const errors = handleErrors(error);
        res.status(400).json({ errors });

    }
}


//Requests de Login
module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        
        //Chama o método do Model tentando logar o usuário
        const user = await User.login(email, password);
        
        //Cria o token para logar o usuário
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

        res.status(200).json({ user: user._id });


    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}

//Logout
module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}