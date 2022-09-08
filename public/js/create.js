mask('#cpf', '000.000.000-00', '[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}')

function mask(selector, mask, regex) {
    const text = document.querySelector(selector);

    if (regex) {
        text.setAttribute('pattern', regex);
    }

    text.addEventListener('keypress', () => addValue(mask, text.value.length, text));

    function addValue(origin, now, input) {
        if (origin[now] && origin[now] !== '0') {
            input.value += origin[now];

            if (origin[now +1] && origin[now +1] !== '0') {
                addValue(origin, now +1, input);
            }
        }
    }
}