// testando modelos para erros
class ValidationError extends Error {
    constructor(name, message) {
        super(message);
        this.name = name;
    }
}

module.exports = ValidationError;