const calendarEl = document.getElementById('calendar');
const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    events: 'consultas',
    eventClick: (info) => {
        location.href = '/event/' + info.event.id;
    }
});

calendar.render();