const { Router } = require("express");
const router = Router();

const AppointmentService = require('../services/AppointmentService');

const ValidationError = require('../models/Error');
const AppointmentFactory = require("../factories/AppointmentFactory");

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/cadastro', (req, res) => {
    const dados = {
        name: req.flash('name_value')[0],
        email: req.flash('email_value')[0],
        cpf: req.flash('cpf_value')[0],
        desc: req.flash('desc_value')[0],
        date: req.flash('date_value')[0]
    }

    const erros = {
        name: req.flash('name_error')[0] || '',
        email: req.flash('email_error')[0] || '',
        cpf: req.flash('cpf_error')[0] || '',
        desc: req.flash('desc_error')[0] || '',
        date: req.flash('date_error')[0] || ''
    }

    res.render('create', { erros, dados });
});

router.post('/create', async (req, res) => {
    
    function verifyChar(cpf, ini, fim, char) {

        let result = i = 0;

        for (let count = ini; count >= fim; count--) {
            result += +cpf[i] * count;
            i++
        }

        result = 11 - (result % 11);

        if ( result != char ) {
            return false;
        }

        return true;
    }

    try {
        let { name, email, cpf, desc, date } = req.body;

        name = name.trim();
        email = email.trim();
        cpf = cpf.trim();
        desc = desc.trim();

        req.flash('name_value', name );
        req.flash('email_value', email );
        req.flash('cpf_value', cpf );
        req.flash('desc_value', desc );
        req.flash('date_value', date );

        // RegExp que serão usadas para validação
        const regName = /^[\u00C0-\u00FF\w\s]{3,100}$/;
        const regMail = /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/;

        if (!name || !regName.test(name) || name.length > 100) {
            throw new ValidationError('name_error', 'Nome ausente ou inválido.');
        }

        if (!email || !regMail.test(email) || email.length > 100) {
            throw new ValidationError('email_error', 'Email ausente ou inválido.');
        }

        if (!cpf || cpf.length != 14) {
            throw new ValidationError('cpf_error', 'CPF inválido ou ausente.');
        }

        const NoFormatCPF = cpf.replace(/\.|-/g, '').split('');

        if (!verifyChar(NoFormatCPF, 10, 2, +cpf.slice(-2, -1))) {
            throw new ValidationError('cpf_error', 'CPF inválido.');
        } else
        if (!verifyChar(NoFormatCPF, 11, 2, +cpf.slice(-1))) {
            throw new ValidationError('cpf_error', 'CPF inválido.');
        }

        if (!desc || desc.length > 400) {
            throw new ValidationError('desc_error', 'Descrição inválida ou ausente.');
        }

        if (!date || new Date(date) < new Date()) {
            throw new ValidationError('date_error', 'Data inválida.');
        }

        await AppointmentService.create(req.body);

        res.redirect('/')

    } catch (e) {
        if (e instanceof ValidationError) {
            req.flash(e.name, e.message);
            console.log(e);

        } else {
            console.log(e);
        }
        res.redirect('/cadastro');
    }
});

router.get('/consultas', async (req, res) => {
    try {
        const appointments = await AppointmentService.findAll(false);
        res.json(appointments);

    } catch (e) {
        console.log(e);
        res.redirect('/');
    }
});

router.get('/event/:id', async (req, res) => {
    const { id } = req.params
    try {
        const consulta = await AppointmentService.findById(id);
        if (!consulta) {
            res.redirect('/');
            return
        }
        
        res.render('consulta', consulta);
        
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.post('/event/finish', async (req, res) => {
    const { id } = req.body;
    try {
        await AppointmentService.finishAppo(id);
        res.redirect('/');

    } catch (error) {
        console.log(error);
        res.redirect('/event/' + id);
    }
});

router.get('/list', async (req, res) => {
    const query = req.query.q;
    const { filter } = req.query;
    try {
        let consultas;
        if (!query) {
            consultas = await AppointmentService.findAll();
        } else {
            consultas = await AppointmentService.findByQuery(query);
        }

        consultas = AppointmentFactory.order(consultas, filter);

        res.render('list', { consultas: consultas, query });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

setInterval(async () => {
    try {
        await AppointmentService.notifyClient();
    } catch (error) {
        console.log(error);
    }
}, 1000 * 5);

router.use((req, res) => res.redirect('/'));

module.exports = router;