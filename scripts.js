let counter = 0;

document.addEventListener('DOMContentLoaded', function() {
    init();
});

function init() {
    document.getElementById('add-item').addEventListener('click', addItem);
    document.getElementById('calculate').addEventListener('click', calculate);
    document.getElementById('reset').addEventListener('click', reset);
    
    addItem();
    addItem();
    addItem();
}

function addItem() {
    counter++;
    const id = `item-${counter}`;
    
    const item = document.createElement('div');
    item.className = 'item';
    item.id = id;
    item.innerHTML = `
        <div class="item-field">
            <div class="label">
                <i class="fa-solid fa-microchip"></i>
                <span>R${counter}</span>
            </div>
            <div class="input-group">
                <input 
                    type="number" 
                    class="input-resistance" 
                    placeholder="Valeur de R${counter}" 
                    min="0" 
                    step="0.01"
                    data-id="${id}"
                    data-type="resistance"
                >
                <span class="unit">Ω</span>
            </div>
        </div>
        <div class="item-field">
            <div class="label">
                <i class="fa-solid fa-bolt"></i>
                <span>U${counter}</span>
            </div>
            <div class="input-group">
                <input 
                    type="number" 
                    class="input-voltage" 
                    placeholder="Valeur de U${counter}" 
                    min="0" 
                    step="0.01"
                    data-id="${id}"
                    data-type="voltage"
                >
                <span class="unit">V</span>
            </div>
        </div>
        <button class="btn-remove" onclick="removeItem('${id}')">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;
    
    document.getElementById('items-list').appendChild(item);
    
    setTimeout(() => {
        item.style.animation = 'fadeIn 0.3s ease-in';
    }, 10);
}

function removeItem(id) {
    const item = document.getElementById(id);
    if (item && document.querySelectorAll('.item').length > 1) {
        item.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            item.remove();
            renumber();
        }, 300);
    } else {
        notify('Vous devez avoir au moins une résistance', 'warning');
    }
}

function renumber() {
    const items = document.querySelectorAll('.item');
    counter = items.length;
    
    items.forEach((item, index) => {
        const num = index + 1;
        
        const fields = item.querySelectorAll('.item-field');
        const rField = fields[0];
        const uField = fields[1];
        
        if (rField) {
            const rLabel = rField.querySelector('.label span');
            const rInput = rField.querySelector('.input-resistance');
            if (rLabel) rLabel.textContent = `R${num}`;
            if (rInput) rInput.placeholder = `Valeur de R${num}`;
        }
        
        if (uField) {
            const uLabel = uField.querySelector('.label span');
            const uInput = uField.querySelector('.input-voltage');
            if (uLabel) uLabel.textContent = `U${num}`;
            if (uInput) uInput.placeholder = `Valeur de U${num}`;
        }
    });
}

function calculate() {
    const voltage = parseFloat(document.getElementById('voltage').value) || null;
    const current = parseFloat(document.getElementById('current').value) || null;
    const totalR = parseFloat(document.getElementById('total-resistance').value) || null;
    
    const items = document.querySelectorAll('.item');
    const resistances = [];
    const voltages = [];
    
    items.forEach((item) => {
        const rInput = item.querySelector('.input-resistance');
        const uInput = item.querySelector('.input-voltage');
        
        const r = parseFloat(rInput.value) || null;
        const u = parseFloat(uInput.value) || null;
        
        resistances.push(r);
        voltages.push(u);
    });
    
    const allValues = [voltage, current, totalR, ...resistances, ...voltages].filter(v => v !== null && v > 0);
    if (allValues.length < 2) {
        notify('Veuillez entrer au moins 2 valeurs valides pour effectuer un calcul', 'warning');
        return;
    }
    
    const data = {
        voltage: voltage,
        current: current,
        totalR: totalR,
        resistances: [...resistances],
        voltages: [...voltages]
    };
    
    try {
        if (data.totalR === null) {
            const known = data.resistances.filter(r => r !== null && r > 0);
            if (known.length === data.resistances.length && known.length > 0) {
                data.totalR = known.reduce((sum, r) => sum + r, 0);
            }
        }
        
        if (data.current === null && data.voltage !== null && data.voltage > 0 && data.totalR !== null && data.totalR > 0) {
            data.current = data.voltage / data.totalR;
        }
        
        if (data.voltage === null && data.current !== null && data.current > 0 && data.totalR !== null && data.totalR > 0) {
            data.voltage = data.totalR * data.current;
        }
        
        if (data.totalR === null && data.voltage !== null && data.voltage > 0 && data.current !== null && data.current > 0) {
            data.totalR = data.voltage / data.current;
        }
        
        const knownV = data.voltages.filter(v => v !== null && v > 0);
        if (data.voltage === null && knownV.length === data.voltages.length && knownV.length > 0) {
            data.voltage = knownV.reduce((sum, v) => sum + v, 0);
        }
        
        if (data.current !== null && data.current > 0) {
            for (let i = 0; i < data.resistances.length; i++) {
                if (data.resistances[i] === null && data.voltages[i] !== null && data.voltages[i] > 0) {
                    data.resistances[i] = data.voltages[i] / data.current;
                }
            }
        }
        
        if (data.current !== null && data.current > 0) {
            for (let i = 0; i < data.voltages.length; i++) {
                if (data.voltages[i] === null && data.resistances[i] !== null && data.resistances[i] > 0) {
                    data.voltages[i] = data.resistances[i] * data.current;
                }
            }
        }
        
        if (data.current === null && data.voltage !== null && data.voltage > 0) {
            for (let i = 0; i < data.resistances.length; i++) {
                if (data.resistances[i] !== null && data.resistances[i] > 0 && 
                    data.voltages[i] !== null && data.voltages[i] > 0) {
                    data.current = data.voltages[i] / data.resistances[i];
                    break;
                }
            }
        }
        
        if (data.totalR !== null && data.totalR > 0) {
            const knownR = data.resistances.filter(r => r !== null && r > 0);
            const unknownIdx = [];
            data.resistances.forEach((r, idx) => {
                if (r === null || r <= 0) unknownIdx.push(idx);
            });
            
            if (unknownIdx.length === 1) {
                const sumKnown = knownR.reduce((sum, r) => sum + r, 0);
                data.resistances[unknownIdx[0]] = data.totalR - sumKnown;
            }
        }
        
        if (data.voltage !== null && data.voltage > 0) {
            const knownV = data.voltages.filter(v => v !== null && v > 0);
            const unknownIdx = [];
            data.voltages.forEach((v, idx) => {
                if (v === null || v <= 0) unknownIdx.push(idx);
            });
            
            if (unknownIdx.length === 1) {
                const sumKnown = knownV.reduce((sum, v) => sum + v, 0);
                data.voltages[unknownIdx[0]] = data.voltage - sumKnown;
            }
        }
        
        if (data.current === null) {
            for (let i = 0; i < data.resistances.length; i++) {
                if (data.resistances[i] !== null && data.resistances[i] > 0 && 
                    data.voltages[i] !== null && data.voltages[i] > 0) {
                    data.current = data.voltages[i] / data.resistances[i];
                    break;
                }
            }
        }
        
        if (data.current !== null && data.current > 0) {
            for (let i = 0; i < data.resistances.length; i++) {
                if (data.resistances[i] === null && data.voltages[i] !== null && data.voltages[i] > 0) {
                    data.resistances[i] = data.voltages[i] / data.current;
                }
            }
            for (let i = 0; i < data.voltages.length; i++) {
                if (data.voltages[i] === null && data.resistances[i] !== null && data.resistances[i] > 0) {
                    data.voltages[i] = data.resistances[i] * data.current;
                }
            }
        }
        
        display(data);
        
    } catch (error) {
        notify('Erreur lors du calcul. Vérifiez vos valeurs.', 'error');
        console.error(error);
    }
}

function display(data) {
    const section = document.getElementById('results-section');
    const content = document.getElementById('results-content');
    
    function format(value, unit) {
        if (value === null) return null;
        
        if (Math.abs(value) < 0.001 && Math.abs(value) > 0) {
            const exp = Math.floor(Math.log10(Math.abs(value)));
            const mant = value / Math.pow(10, exp);
            return `${mant.toFixed(3)} × 10<sup>${exp}</sup> ${unit}`;
        } else if (Math.abs(value) < 0.01) {
            return value.toFixed(6) + ' ' + unit;
        } else if (Math.abs(value) < 0.1) {
            return value.toFixed(5) + ' ' + unit;
        } else if (Math.abs(value) < 1) {
            return value.toFixed(4) + ' ' + unit;
        } else if (Math.abs(value) < 10) {
            return value.toFixed(3) + ' ' + unit;
        } else {
            return value.toFixed(2) + ' ' + unit;
        }
    }
    
    let html = '<div class="results-grid">';
    
    html += `
    <div class="card glass">
        <div class="icon"><i class="fa-solid fa-bolt"></i></div>
        <h3>Tension Totale (U)</h3>
        <p class="value">${data.voltage !== null ? format(data.voltage, 'V') : '<span class="unavailable">Pas assez de valeurs</span>'}</p>
    </div>`;
    
    html += `
    <div class="card glass">
        <div class="icon"><i class="fa-solid fa-arrow-right"></i></div>
        <h3>Courant (I)</h3>
        <p class="value">${data.current !== null ? format(data.current, 'A') : '<span class="unavailable">Pas assez de valeurs</span>'}</p>
    </div>`;
    
    html += `
    <div class="card glass">
        <div class="icon"><i class="fa-solid fa-microchip"></i></div>
        <h3>Résistance Totale (R<sub>tot</sub>)</h3>
        <p class="value">${data.totalR !== null ? format(data.totalR, 'Ω') : '<span class="unavailable">Pas assez de valeurs</span>'}</p>
    </div>`;
    
    html += '</div>';
    
    html += '<div class="individual">';
    html += '<h3><i class="fa-solid fa-list"></i> Valeurs Individuelles</h3>';
    html += '<div class="individual-grid">';
    
    for (let i = 0; i < data.resistances.length; i++) {
        html += `<div class="individual-item">`;
        html += `<div class="individual-header">R${i+1} / U${i+1}</div>`;
        
        if (data.resistances[i] !== null) {
            html += `<div class="individual-value">R${i+1} = ${format(data.resistances[i], 'Ω')}</div>`;
        } else {
            html += `<div class="individual-value unavailable">R${i+1} = Pas assez de valeurs</div>`;
        }
        
        if (data.voltages[i] !== null) {
            html += `<div class="individual-value">U${i+1} = ${format(data.voltages[i], 'V')}</div>`;
        } else {
            html += `<div class="individual-value unavailable">U${i+1} = Pas assez de valeurs</div>`;
        }
        
        html += `</div>`;
    }
    
    html += '</div></div>';
    
    content.innerHTML = html;
    
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    const cards = section.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'slideIn 0.4s ease-out';
        }, index * 100);
    });
    
    notify('Calculs effectués avec succès !', 'success');
}

function reset() {
    document.getElementById('voltage').value = '';
    document.getElementById('current').value = '';
    document.getElementById('total-resistance').value = '';
    
    const inputs = document.querySelectorAll('.input-resistance, .input-voltage');
    inputs.forEach(input => {
        input.value = '';
        input.style.borderColor = '';
    });
    
    const section = document.getElementById('results-section');
    section.style.display = 'none';
    
    const items = document.querySelectorAll('.item');
    items.forEach((item, index) => {
        if (index > 2) {
            item.remove();
        }
    });
    
    counter = 3;
    
    notify('Calculateur réinitialisé', 'info');
}

function notify(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    
    let icon;
    switch(type) {
        case 'success':
            icon = 'fa-circle-check';
            break;
        case 'error':
            icon = 'fa-circle-xmark';
            break;
        case 'warning':
            icon = 'fa-triangle-exclamation';
            break;
        default:
            icon = 'fa-circle-info';
    }
    
    notif.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => {
            notif.remove();
        }, 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('input', function(e) {
    if (e.target.classList.contains('input-resistance')) {
        const value = parseFloat(e.target.value);
        if (isNaN(value) || value <= 0) {
            e.target.style.borderColor = '#e74c3c';
        } else {
            e.target.style.borderColor = '';
        }
    }
});

document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.classList.contains('input-resistance')) {
        calculate();
    }
});

window.addItem = addItem;
window.removeItem = removeItem;
window.calculate = calculate;
window.reset = reset;
window.renumber = renumber;
