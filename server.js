const { log } = require('console');
const express = require('express');
const app = express();

const routes = require('./routes/routes');
const flash = require('express-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/agendamento');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

app.use(cookieParser('sa56dfs4dfsf32fasdf'))

app.use(session({
    secret: 'sdabhjfbu32kjf2nb32',
    resave: false,
    saveUninitialized: true,
    cookie: {
        // secure: true, // só habilitar caso o server esteja em uma conexão https://
        maxAge: 86400000 * 1 // 1 dia
    }
}));

app.use(flash());

app.use('/', routes);

const port = 8080;
app.listen(port, () => {
    log(`Servidor iniciado com sucesso: http://localhost:${port}`);
});