class AppointmentFactory {
    build(appointment) {

        const startDate = new Date(appointment.date);

        const endDate = new Date(appointment.date);

        // definindo a data de termino como 1 hora e 30 min após a inicio
        endDate.setHours(startDate.getHours() + 1);
        endDate.setMinutes(startDate.getMinutes() + 30);

        const appo = {
            id: appointment._id,
            title: `${appointment.name} | ${appointment.desc}`,
            name: appointment.name,
            email: appointment.email,
            desc: appointment.desc,
            start: startDate,
            end: endDate,
            notified: appointment.notified
        }

        return appo;
    }

    order(arr, filter) {

        switch (filter) {
            case 'DATEASC':
                return arr.sort((objA, objB) => Number(objA.start) - Number(objB.start));
                break;
            case 'ALFDESC':
                console.log('ALFDESC');
                return arr.sort((objA, objB) => objA.name > objB.name ? -1 : objA.name < objB.name ? 1 : 0);
                break;
            case 'ALFASC':
                console.log('ALFASC');
                return arr.sort((objA, objB) => objA.name < objB.name ? -1 : objA.name > objB.name ? 1 : 0);
                break;
            default:
                console.log('DATEDESC');
                return arr.sort((objA, objB) => Number(objB.start) - Number(objA.start));
                break;
        }
    }
}

module.exports = new AppointmentFactory();