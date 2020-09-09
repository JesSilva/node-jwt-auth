const jwt = require('jsonwebtoken');
const User = require('../models/User');

//Verifica se o cookie existe (O usuário está logado)
const requireAuth = (req, res, next) =>{

    const token = req.cookies.jwt;

    //Verifica se o jwt existe e é válido
    if(token){

        //Verifica o token
        jwt.verify(token, 'net ninja secret', (err, decodedToken) => {
            if(err){
                res.redirect('/login');
            }else{
                next();
            }
        });

    }else{
        //Redireciona para a tela de login
        res.redirect('/login');
    }

}

//Valida o usuário atual
const checkUser = (req, res, next) => {

    const token = req.cookies.jwt;

    if(token){

        jwt.verify(token, 'net ninja secret', async (err, decodedToken) => {

            if(err){

                res.locals.user = null;
                next();

            }else{

                //Armazena localmente o resultado
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();

            }
        });


    }else{
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth, checkUser };