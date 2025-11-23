// ==================== SISTEMA DE NOTIFICACIONES ====================


// Muestra una notificación con título, mensaje y botones personalizados

function showNotification(title, message, buttons = []) {
    const overlay = document.getElementById('notificationOverlay');
    const notification = document.getElementById('gameNotification');
    const titleElement = document.getElementById('notificationTitle');
    const messageElement = document.getElementById('notificationMessage');
    const buttonsContainer = document.getElementById('notificationButtons');

    titleElement.textContent = title;
    messageElement.innerHTML = message;
    buttonsContainer.innerHTML = '';

    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.textContent = button.text;
        btn.className = `notification-btn ${button.type || 'confirm'}`;
        btn.onclick = () => {
            hideNotification();
            if (button.callback) button.callback();
        };
        buttonsContainer.appendChild(btn);
    });

    if (buttons.length === 0) {
        const defaultBtn = document.createElement('button');
        defaultBtn.textContent = 'Aceptar';
        defaultBtn.className = 'notification-btn confirm';
        defaultBtn.onclick = hideNotification;
        buttonsContainer.appendChild(defaultBtn);
    }

    overlay.classList.add('active');
    notification.classList.add('active');
}

// Oculta la notificación
function hideNotification() {
    const overlay = document.getElementById('notificationOverlay');
    const notification = document.getElementById('gameNotification');
    overlay.classList.remove('active');
    notification.classList.remove('active');
}