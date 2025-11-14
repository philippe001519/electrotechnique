// Calculateur de Résistances - ElectroTech

// État global de l'application
let resistances = [];
let resistanceCounter = 0;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Ajouter les écouteurs d'événements
    document.getElementById('add-resistance').addEventListener('click', addResistance);
    document.getElementById('calculate-btn').addEventListener('click', calculateResults);
    document.getElementById('reset-btn').addEventListener('click', resetCalculator);
    
    // Initialiser avec 2 résistances par défaut
    addResistance();
    addResistance();
    
    // Navigation toggle pour mobile
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('open');
        });
    }
    
    // Fermer le menu mobile lors du clic sur un lien
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Smooth scroll pour les ancres
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Ajouter une nouvelle résistance
function addResistance() {
    resistanceCounter++;
    const id = `resistance-${resistanceCounter}`;
    
    const resistanceItem = document.createElement('div');
    resistanceItem.className = 'resistance-item';
    resistanceItem.id = id;
    resistanceItem.innerHTML = `
        <div class="resistance-label">
            <i class="fa-solid fa-microchip"></i>
            <span>R${resistanceCounter}</span>
        </div>
        <div class="resistance-input-group">
            <input 
                type="number" 
                class="resistance-input" 
                placeholder="Entrez la valeur" 
                min="0" 
                step="0.01"
                data-id="${id}"
            >
            <span class="resistance-unit">Ω</span>
        </div>
        <button class="btn-remove" onclick="removeResistance('${id}')">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;
    
    document.getElementById('resistances-list').appendChild(resistanceItem);
    
    // Ajouter l'animation d'apparition
    setTimeout(() => {
        resistanceItem.style.animation = 'fadeIn 0.3s ease-in';
    }, 10);
}

// Supprimer une résistance
function removeResistance(id) {
    const item = document.getElementById(id);
    if (item && document.querySelectorAll('.resistance-item').length > 1) {
        item.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            item.remove();
        }, 300);
    } else {
        showNotification('Vous devez avoir au moins une résistance', 'warning');
    }
}

// Calculer les résultats
function calculateResults() {
    const inputs = document.querySelectorAll('.resistance-input');
    const values = [];
    
    // Récupérer et valider les valeurs
    let hasError = false;
    inputs.forEach(input => {
        const value = parseFloat(input.value);
        if (isNaN(value) || value <= 0) {
            input.style.borderColor = '#e74c3c';
            hasError = true;
        } else {
            input.style.borderColor = '';
            values.push(value);
        }
    });
    
    if (hasError || values.length === 0) {
        showNotification('Veuillez entrer des valeurs valides pour toutes les résistances', 'error');
        return;
    }
    
    // Obtenir le type de calcul
    const calcType = document.getElementById('calc-type').value;
    
    let totalResistance;
    let formula;
    
    switch (calcType) {
        case 'series':
            totalResistance = calculateSeries(values);
            formula = `R<sub>total</sub> = ${values.map((v, i) => `R${i+1}`).join(' + ')} = ${values.join(' + ')} = ${totalResistance.toFixed(2)} Ω`;
            break;
            
        case 'parallel':
            totalResistance = calculateParallel(values);
            formula = `1/R<sub>total</sub> = ${values.map((v, i) => `1/R${i+1}`).join(' + ')} = ${values.map(v => `1/${v}`).join(' + ')} ⟹ R<sub>total</sub> = ${totalResistance.toFixed(2)} Ω`;
            break;
            
        case 'mixed':
            // Pour le mode mixte, on fait série par défaut (peut être amélioré)
            totalResistance = calculateSeries(values);
            formula = `Mode mixte : R<sub>total</sub> = ${totalResistance.toFixed(2)} Ω (calcul série par défaut)`;
            break;
    }
    
    // Calcul du courant (avec V = 12V par défaut)
    const voltage = 12;
    const current = voltage / totalResistance;
    
    // Calcul de la puissance (P = V × I)
    const power = voltage * current;
    
    // Afficher les résultats
    displayResults(totalResistance, current, power, formula);
}

// Calcul en série
function calculateSeries(values) {
    return values.reduce((sum, value) => sum + value, 0);
}

// Calcul en parallèle
function calculateParallel(values) {
    const inverseSum = values.reduce((sum, value) => sum + (1 / value), 0);
    return 1 / inverseSum;
}

// Afficher les résultats
function displayResults(resistance, current, power, formula) {
    const resultsSection = document.getElementById('results-section');
    
    // Mettre à jour les valeurs
    document.getElementById('total-resistance').textContent = `${resistance.toFixed(2)} Ω`;
    document.getElementById('total-current').textContent = `${current.toFixed(3)} A`;
    document.getElementById('total-power').textContent = `${power.toFixed(2)} W`;
    document.getElementById('formula-text').innerHTML = formula;
    
    // Afficher la section des résultats avec animation
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Animation des cartes de résultats
    const resultCards = resultsSection.querySelectorAll('.result-card');
    resultCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'slideIn 0.4s ease-out';
        }, index * 100);
    });
    
    showNotification('Calculs effectués avec succès !', 'success');
}

// Réinitialiser le calculateur
function resetCalculator() {
    // Réinitialiser les valeurs
    const inputs = document.querySelectorAll('.resistance-input');
    inputs.forEach(input => {
        input.value = '';
        input.style.borderColor = '';
    });
    
    // Cacher les résultats
    const resultsSection = document.getElementById('results-section');
    resultsSection.style.display = 'none';
    
    // Réinitialiser le sélecteur
    document.getElementById('calc-type').value = 'series';
    
    // Supprimer toutes les résistances sauf les 2 premières
    const resistanceItems = document.querySelectorAll('.resistance-item');
    resistanceItems.forEach((item, index) => {
        if (index > 1) {
            item.remove();
        }
    });
    
    showNotification('Calculateur réinitialisé', 'info');
}

// Système de notifications
function showNotification(message, type = 'info') {
    // Supprimer toute notification existante
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    // Créer la nouvelle notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
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
    
    notification.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Afficher avec animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Masquer et supprimer après 3 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Animations CSS à ajouter dynamiquement
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

// Validation en temps réel des entrées
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('resistance-input')) {
        const value = parseFloat(e.target.value);
        if (isNaN(value) || value <= 0) {
            e.target.style.borderColor = '#e74c3c';
        } else {
            e.target.style.borderColor = '';
        }
    }
});

// Calcul automatique lors de la pression sur Enter
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.classList.contains('resistance-input')) {
        calculateResults();
    }
});

// Exporter les fonctions pour qu'elles soient accessibles globalement
window.addResistance = addResistance;
window.removeResistance = removeResistance;
window.calculateResults = calculateResults;
window.resetCalculator = resetCalculator;
