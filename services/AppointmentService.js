const appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const AppointmentFactory = require('../factories/AppointmentFactory');

// nodeMailer
const ejs = require('ejs');
const mailer = require('nodemailer');

const Appointment = mongoose.model('appointment', appointment);

class apointmentService {
    async create({ name, email, cpf, desc, date }) {
        // FAZER A PARTE DA VALIDAÇÃO
        return new Promise(async (resolve, reject) => {
            try {
                const newApoint = new Appointment({
                    name,
                    email,
                    cpf,
                    desc,
                    date
                });
    
                console.log(newApoint);
    
                await newApoint.save();

                resolve();
    
            } catch (error) {
                reject(error);
            }
        })
    }

    async findAll(finished = true) {
        return new Promise(async (resolve, reject) => {
            try {
                const appointments = await Appointment.find();

                if (finished) {
                    resolve(appointments.map(consulta => AppointmentFactory.build(consulta)));
                }

                resolve( (appointments
                            .filter(consulta => !consulta.finished))
                            .map(consulta => AppointmentFactory.build(consulta)) );

            } catch (e) {
                console.log(e);
                reject();
            }
        });
    }

    async findById(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const consulta = Appointment.findById(id);
                resolve(consulta);
            } catch (e) {
                reject(e);
            }
        })
    }

    async finishAppo(id) {
        return new Promise(async (resolve, reject) => {
            try {
                await Appointment.findByIdAndUpdate(id, { finished: true });
                resolve();
            } catch (error) {
                reject(error);
            }
        })
    }

    async findByQuery(query) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(query);
                const consultas = await Appointment.find().or([{ cpf: query }, { email: query }]);
                resolve((consultas
                    .map(consulta => AppointmentFactory.build(consulta))))

            } catch (error) {
                reject(error);
            }
        })
    }

    async notifyClient() {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('Checando consultas pendentes');

                const consultas = await this.findAll(false);
                consultas.forEach(async consulta => {

                    const date = consulta.start.getTime(); // data da consulta

                    const hour = 3600000; // 1 hora

                    const diff = date - Date.now(); // data atual

                    if (diff < hour /* && diff > 0 */) {
                        console.log(`${consulta.name} tem uma consulta pendente!`);
                        if (consulta.notified) {
                            console.log(`${consulta.name} já foi notificado`);
                            return
                        }

                        console.log(`Vou notificar ${consulta.name}!`);
                        const transporter = mailer.createTransport({
                                host: 'smtp.mailtrap.io',
                                port: 25,
                                secure: false,
                                service: 'mailtrap',
                                auth: {
                                    user: '77069914f27854',
                                    pass: 'ead61090e0db47',
                                },
                                tls: { rejectUnauthorized: false }
                            });

                        console.log('Enviando email (function)!' + consulta.name);
                        await this.sendMail(transporter, consulta.email, 'email', consulta)

                        await Appointment.findByIdAndUpdate(consulta.id, { notified: true });
                        // .then(async () => {
                        //     console.log('Email enviado! Mudando status da consulta!' + consulta.name);
                        //     await Appointment.findByIdAndUpdate(consulta.id, { notified: true });

                        // }).catch((e) => {
                        //     console.log('Não foi possivel enviar o email :(' + consulta.name);
                        //     throw e
                        // })
                    }
                });
            } catch (e) {
                console.log('ERRO GRANDE NOTIFYCLIENT');
                reject(e)
            }
        });
    }

    async sendMail(transporter, to, view, data = { consulta: '' }) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('Criando email!' + data.name);
                console.log(data);

                ejs.renderFile(`views/${view}.ejs`, { consulta: data }, async (error, viewLoaded) => {
                    if (error) {
                        console.log('Não foi possivel criar o email :(');
                        throw error;
                    }
                    
                    console.log('Enviando o email! (definitivo)' + data.name);
                    const info = await transporter.sendMail({
                        from: "Consultas e Agendamentos Garcia <consultaseagendamentos@garcia.com>",
                        to: to,
                        subject: "Confirmação de consulta - Consultas e Agendamentos Garcia.",
                        html: viewLoaded
                    });

                    console.log(info);
                    console.log('Tudo certo!' + data.name);
                    resolve();
                });
            } catch (error) {
                console.log('ERRO GRANDE SENDMAIL');
                reject(error);
            }
        });
    }
}

module.exports = new apointmentService();