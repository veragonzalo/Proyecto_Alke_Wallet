/* INDEX.HTML */
document.addEventListener('DOMContentLoaded', function() {
    // Helper: mostrar alerta bootstrap en #alertPlaceholder
    function showAlert(message, type = 'success', timeout = 4000) {
        const placeholder = document.getElementById('alertPlaceholder');
        if (!placeholder) {
            // fallback a alert() si no existe el placeholder
            alert(message);
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.innerHTML = `\n      <div class="alert alert-${type} alert-dismissible fade show" role="alert">\n        ${message}\n        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>\n      </div>`;

        placeholder.append(wrapper);

        // Auto cerrar después de timeout ms
        if (timeout > 0) {
            setTimeout(() => {
                const alertEl = wrapper.querySelector('.alert');
                if (alertEl) {
                    const bsAlert = bootstrap.Alert.getOrCreateInstance(alertEl);
                    bsAlert.close();
                }
            }, timeout);
        }
    }

    // Agregar listener al formulario de login si existe (sin depender de jQuery)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            var usernameEl = document.getElementById('email');
            var passwordEl = document.getElementById('password');
            var username = usernameEl ? usernameEl.value : '';
            var password = passwordEl ? passwordEl.value : '';

            // Verificar las credenciales
            if (username === 'juan@gmail.com' && password === '12345') {
                // Credenciales válidas, mostrar alerta de éxito y redirigir
                showAlert('Inicio de sesión exitoso. Redirigiendo...', 'success', 2500);
                setTimeout(() => {
                    window.location.href = 'menu.html';
                }, 1000);
            } else {
                // Credenciales inválidas, mostrar mensaje de error
                showAlert('Usuario o contraseña inválido. Inténtalo de nuevo.', 'danger', 2500);

                // Limpiar los campos para que el usuario reingrese los datos
                if (usernameEl) {
                    usernameEl.value = '';
                    usernameEl.focus();
                }
                if (passwordEl) {
                    passwordEl.value = '';
                }
            }
        });
    }
});


/* MENU.HTML */

function depositar(){
    alert("Redirigiendo a la pantalla Deposito...")
    location.href = "deposit.html";
    
}

function enviar_dinero(){
    alert("Redirigiendo a la pantalla Enviar Dinero...")
    location.href = "sendmoney.html";
}

function movimientos(){
    alert("Redirigiendo a la pantalla de Movimientos...")
    location.href = "transactions.html";
}

function salir(){
    alert("Saliendo del sistema...")
    location.href = "index.html";
}

function menu(){
    alert("Volviendo al menú principal...")
    location.href = "menu.html";
}


/* Aumentar saldo visible en MENU.HTML al hacer un deposito desde DESPOSIT.HTML */

// MENU.HTML - Si no existe, lo crea con valor 0

document.addEventListener("DOMContentLoaded", () => {
    const saldoSpan = document.getElementById("saldo");
    if (saldoSpan) {
        let saldo = localStorage.getItem("saldo");

        if (saldo === null) {
            saldo = 0;
            localStorage.setItem("saldo", saldo);
        }

        saldoSpan.textContent = saldo;
    }
});

// DEPOSIT.HTML - Mostrar saldo actual al cargar (respaldo jQuery/vanilla)
document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById('saldoActual');
    if (el) {
        const saldo = Number(localStorage.getItem('saldo')) || 0;
        el.textContent = saldo;
    }
});

/* DEPOSIT.HTML */
   
function sumar() {
    // jQuery 
    let saldoActual = Number(localStorage.getItem("saldo")) || 0;
    let deposito = Number(document.getElementById("valor").value);

    if (isNaN(deposito) || deposito <= 0) {
        if (window.jQuery) {
            $('#alert-container').empty().append(`\n <div class="alert alert-danger alert-dismissible fade show" role="alert">\n Ingrese un número válido\n  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>\n  </div>\n  `);
        } else {
            alert("Ingrese un número válido");
        }
        return;
    }

    let nuevoSaldo = saldoActual + deposito;
    localStorage.setItem("saldo", nuevoSaldo);

    // Registrar movimiento de depósito
    let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
    movimientos.push({
        tipo: "Depósito",
        monto: deposito,
        fecha: new Date().toLocaleString(),
        destino: null
    });
    localStorage.setItem("movimientos", JSON.stringify(movimientos));

    // Actualizar DOM como respaldo
    const saldoEl = document.getElementById('saldoActual');
    if (saldoEl) saldoEl.textContent = nuevoSaldo;
    const saldoMenuEl = document.getElementById('saldo');
    if (saldoMenuEl) saldoMenuEl.textContent = nuevoSaldo;
    const legendEl = document.getElementById('deposit-legend');
    if (legendEl) {
        legendEl.innerHTML = `<div class="fs-4 fw-bold text-success">Has depositado: $${deposito}</div>`;
    }

    if (window.jQuery) {
        // actualizar saldo en pantalla (jQuery)
        $('#saldoActual').text(nuevoSaldo);
        $('#saldo').text(nuevoSaldo); // si existe en menú

        // mostrar leyenda (jQuery) 
        $('#deposit-legend').html(`<div class="fs-4 fw-bold text-success">Has depositado: $${deposito}</div>`);

        // alerta bootstrap dinámica (jQuery)
        $('#alert-container').empty().append(`\n            <div class="alert alert-success alert-dismissible fade show" role="alert">\n              Depósito realizado: $${deposito}. Nuevo saldo: $${nuevoSaldo}\n              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>\n            </div>\n        `);
    } else {
        alert("Depósito realizado. Nuevo saldo: " + nuevoSaldo);
    }

    setTimeout(function() {
        window.location.href = 'menu.html';
    }, 3000);
}


// =======================
//  CONTACTOS - SENDMONEY
// =======================

// contactos manejados únicamente en memoria durante la sesión
let sessionContactos = [];
let editingIndex = null; // índice del contacto que se está editando

// cargar contactos (inicialmente vacío; nada se lee/escribe en localStorage)
document.addEventListener("DOMContentLoaded", () => {
    const contactList = document.getElementById("contactList");
    if (contactList) {
        cargarContactos();
    }

    // búsqueda ahora se realiza al enviar el formulario #searchForm
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const value = document.getElementById('searchContact').value || '';
            filtrarContactos(value.trim());
        });
    }
});

function cargarContactos() {
    const $lista = $('#contactList');
    $lista.empty();
    contactoSeleccionado = null;
    const box = document.getElementById("contactoSeleccionadoBox");
    if (box) box.classList.add("d-none");
    const enviarBtn = document.getElementById("btnEnviarDinero");
    if (enviarBtn) enviarBtn.classList.add("d-none");

    sessionContactos.forEach((contacto, idx) => {
        const $li = $(`<li class="list-group-item contacto-item d-flex justify-content-between align-items-start">
            <div class="contact-info">
                <strong>${contacto.nombre}</strong><br>
                CBU: ${contacto.cbu}, Alias: ${contacto.alias}, Banco: ${contacto.banco}
            </div>
            <div class="btn-group btn-group-sm ms-2" role="group">
                <button type="button" class="btn btn-outline-secondary btn-edit">Editar</button>
                <button type="button" class="btn btn-outline-danger btn-delete">Eliminar</button>
            </div>
        </li>`);

        $li.find('.contact-info').on('click', function() { seleccionarContacto(contacto, $li.get(0)); });

        $li.find('.btn-edit').on('click', function(e) {
            e.stopPropagation();
            abrirEditarContacto(idx);
        });

        $li.find('.btn-delete').on('click', function(e) {
            e.stopPropagation();
            eliminarContacto(idx);
        });

        $lista.append($li);
    });
}

// Guardar/Actualizar contacto desde modal
document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "guardarContactoBtn") {

        let nombre = document.getElementById("contact-nombre").value;
        let cbu = document.getElementById("contact-cbu").value;
        let alias = document.getElementById("contact-alias").value;
        let banco = document.getElementById("contact-banco").value;

        if (!nombre || !cbu || !alias || !banco) {
            alert("Complete todos los campos para agregar/editar un contacto.");
            return;
        }

        let nuevo = { nombre, cbu, alias, banco };

        if (editingIndex !== null && typeof editingIndex === 'number') {
            // actualizar
            sessionContactos[editingIndex] = nuevo;
            editingIndex = null;
            cargarContactos();
        } else {
            // agregar
            sessionContactos.push(nuevo);
            const idx = sessionContactos.length - 1;
            const $li = $(`<li class="list-group-item contacto-item d-flex justify-content-between align-items-start">
                <div class="contact-info">
                    <strong>${nuevo.nombre}</strong><br>
                    CBU: ${nuevo.cbu}, Alias: ${nuevo.alias}, Banco: ${nuevo.banco}
                </div>
                <div class="btn-group btn-group-sm ms-2" role="group">
                    <button type="button" class="btn btn-outline-secondary btn-edit">Editar</button>
                    <button type="button" class="btn btn-outline-danger btn-delete">Eliminar</button>
                </div>
            </li>`);

            $li.find('.contact-info').on('click', function() { seleccionarContacto(nuevo, $li.get(0)); });
            $li.find('.btn-edit').on('click', function(e) { e.stopPropagation(); abrirEditarContacto(idx); });
            $li.find('.btn-delete').on('click', function(e) { e.stopPropagation(); eliminarContacto(idx); });
            $('#contactList').append($li);
        }

        // cerrar modal
        let modal = bootstrap.Modal.getInstance(document.getElementById('modalContacto'));
        modal.hide();
        // resetear título del modal a modo creación
        const labelReset = document.getElementById('modalContactoLabel');
        if (labelReset) labelReset.textContent = 'Nuevo contacto';

        // limpiar inputs
        $('#contact-nombre').val('');
        $('#contact-cbu').val('');
        $('#contact-alias').val('');
        $('#contact-banco').val('');

        alert("Contacto guardado correctamente...");
    }
});

// Limpiar estado al cancelar el modal
document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "cancelarContactoBtn") {
        resetearModal();
    }
});

// Listener para cuando se cierre el modal (por cualquier razón)
document.addEventListener("hide.bs.modal", (e) => {
    if (e.target && e.target.id === "modalContacto") {
        resetearModal();
    }
});

function resetearModal() {
    editingIndex = null;
    $('#contact-nombre').val('');
    $('#contact-cbu').val('');
    $('#contact-alias').val('');
    $('#contact-banco').val('');
    const label = document.getElementById('modalContactoLabel');
    if (label) label.textContent = 'Nuevo contacto';
}

// búsqueda ahora por formulario; filtrarContactos recrea elementos con botones
function filtrarContactos(texto) {
    texto = (texto || '').toLowerCase();
    const $lista = $('#contactList');
    $lista.empty();

    sessionContactos
        .filter(c => c.nombre.toLowerCase().includes(texto) || c.alias.toLowerCase().includes(texto))
        .forEach((contacto, idx) => {
            const $li = $(`<li class="list-group-item contacto-item d-flex justify-content-between align-items-start">
                <div class="contact-info">
                    <strong>${contacto.nombre}</strong><br>
                    CBU: ${contacto.cbu}, Alias: ${contacto.alias}, Banco: ${contacto.banco}
                </div>
                <div class="btn-group btn-group-sm ms-2" role="group">
                    <button type="button" class="btn btn-outline-secondary btn-edit">Editar</button>
                    <button type="button" class="btn btn-outline-danger btn-delete">Eliminar</button>
                </div>
            </li>`);

            $li.find('.contact-info').on('click', function() { seleccionarContacto(contacto, $li.get(0)); });
            $li.find('.btn-edit').on('click', function(e) { e.stopPropagation(); abrirEditarContacto(idx); });
            $li.find('.btn-delete').on('click', function(e) { e.stopPropagation(); eliminarContacto(idx); });
            $lista.append($li);
        });
}

function abrirEditarContacto(idx) {
    const contacto = sessionContactos[idx];
    if (!contacto) return;
    editingIndex = idx;
    $('#contact-nombre').val(contacto.nombre);
    $('#contact-cbu').val(contacto.cbu);
    $('#contact-alias').val(contacto.alias);
    $('#contact-banco').val(contacto.banco);
    // cambiar título del modal
    const label = document.getElementById('modalContactoLabel');
    if (label) label.textContent = 'Editar contacto';
    const modalEl = document.getElementById('modalContacto');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function eliminarContacto(idx) {
    if (!confirm('¿Eliminar este contacto?')) return;
    const contacto = sessionContactos[idx];
    if (contactoSeleccionado && contactoSeleccionado === contacto) {
        deseleccionarContacto();
    }
    sessionContactos.splice(idx, 1);
    cargarContactos();
}

let contactoSeleccionado = null;

function seleccionarContacto(contacto, elementoHTML) {
    // Si se hace clic nuevamente sobre el mismo elemento, deseleccionar
    if (elementoHTML.classList.contains("contacto-seleccionado")) {
        deseleccionarContacto();
        return;
    }

    contactoSeleccionado = contacto;

    // Quitar selección previa en la lista
    document.querySelectorAll("#contactList .list-group-item")
        .forEach(li => li.classList.remove("contacto-seleccionado"));

    // Marcar el seleccionado
    elementoHTML.classList.add("contacto-seleccionado");

    // Mostrar recuadro superior con datos
    const box = document.getElementById("contactoSeleccionadoBox");
    const info = document.getElementById("contactoSeleccionadoInfo");

    info.innerHTML = `
        <strong>${contacto.nombre}</strong><br>
        CBU: ${contacto.cbu}<br>
        Alias: ${contacto.alias}<br>
        Banco: ${contacto.banco}
    `;

    box.classList.remove("d-none");

    // Mostrar boton de enviar al seleccionar
    const enviarBtn = document.getElementById("btnEnviarDinero");
    if (enviarBtn) enviarBtn.classList.remove("d-none");

    // Mensaje opcional
    // alert(`Contacto seleccionado: ${contacto.nombre}`);
}

function deseleccionarContacto() {
    contactoSeleccionado = null;
    document.querySelectorAll("#contactList .list-group-item")
        .forEach(li => li.classList.remove("contacto-seleccionado"));
    const box = document.getElementById("contactoSeleccionadoBox");
    if (box) box.classList.add("d-none");
    const enviarBtn = document.getElementById("btnEnviarDinero");
    if (enviarBtn) enviarBtn.classList.add("d-none");
}

// Deseleccionar al hacer clic fuera de la lista de contactos
document.addEventListener("click", (e) => {
    // Si el clic está dentro de #contactList o es el propio botón de enviar, no deseleccionar
    if (e.target.closest && e.target.closest('#contactList')) return;
    if (e.target && e.target.id === 'btnEnviarDinero') return;
    // Si el clic está dentro del modal para agregar contacto, no deseleccionar
    if (e.target.closest && e.target.closest('#modalContacto')) return;

    // En cualquier otro caso ocultar la selección
    deseleccionarContacto();
});



/*let contactoSeleccionado = null;

function seleccionarContacto(contacto) {
    contactoSeleccionado = contacto;
    alert(`Contacto seleccionado: ${contacto.nombre}`);
}*/

document.addEventListener("click", (e) => {

    if (e.target && e.target.id === "btnEnviarDinero") {

        if (!contactoSeleccionado) {
            alert("Debe seleccionar un contacto antes de enviar dinero.");
            return;
        }

        let monto = prompt(`Ingrese el monto a enviar a ${contactoSeleccionado.nombre}:`);

        if (!monto || isNaN(monto) || Number(monto) <= 0) {
            alert("Monto inválido.");
            return;
        }

        monto = Number(monto);

        // Leer saldo actual
        let saldoActual = Number(localStorage.getItem("saldo")) || 0;

        if (monto > saldoActual) {
            alert("Saldo insuficiente.");
            return;
        }

        // Descontar del saldo
        let nuevoSaldo = saldoActual - monto;
        localStorage.setItem("saldo", nuevoSaldo);

        // Registrar movimiento
        let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];

        movimientos.push({
            tipo: "Envío",
            monto: monto,
            fecha: new Date().toLocaleString(),
            destino: contactoSeleccionado.nombre
        });

        localStorage.setItem("movimientos", JSON.stringify(movimientos));

        // Mostrar confirmación en la parte inferior y redirigir después
        showSendConfirmation(`Has enviado $${monto} a ${contactoSeleccionado.nombre}. Saldo restante: $${nuevoSaldo}`, 2500, () => {
            window.location = "menu.html";
        });
    }
});

// Mostrar confirmación en la parte inferior de la pantalla
function showSendConfirmation(message, timeout = 2500, callback) {
    const el = document.getElementById('sendConfirm');
    if (!el) {
        // fallback a alert si no existe el contenedor
        alert(message);
        if (callback) callback();
        return;
    }

    el.textContent = message;
    el.classList.remove('d-none');

    // Ocultar después del timeout
    setTimeout(() => {
        el.classList.add('d-none');
        if (typeof callback === 'function') callback();
    }, timeout);
}

// ========================
//   LISTA DE MOVIMIENTOS (renderizado y filtro con jQuery)
// ========================

// Convierte variantes de tipo a una etiqueta legible y consistente
function getTipoTransaccion(tipo) {
    if (!tipo && tipo !== 0) return '';
    const t = String(tipo).trim().toLowerCase();
    if (t === 'envio' || t === 'envío') return 'Envío';
    if (t === 'deposito' || t === 'depósito') return 'Depósito';
    if (t === 'compra') return 'Compra';
    if (t.includes('transferencia')) return 'Transferencia recibida';
    // Fallback: capitalizar primera letra
    return String(tipo).charAt(0).toUpperCase() + String(tipo).slice(1);
}

// Muestra los últimos movimientos según filtro (filtro: 'Todos' o etiqueta legible)
function mostrarUltimosMovimientos(filtro = 'Todos') {
    const $lista = $('#listaMovimientos');
    if (!$lista.length) return; // no estamos en transactions.html

    $lista.empty();
    let movimientos = JSON.parse(localStorage.getItem('movimientos')) || [];

    // Orden: más recientes primero
    movimientos = movimientos.slice().reverse();

    if (filtro && filtro !== 'Todos') {
        const fNorm = String(filtro).trim().toLowerCase();
        movimientos = movimientos.filter(m => getTipoTransaccion(m.tipo).toLowerCase() === fNorm);
    }

    if (movimientos.length === 0) {
        $lista.append('<li class="list-group-item">No hay movimientos para el filtro seleccionado.</li>');
        return;
    }

    movimientos.forEach(mov => {
        const tipoLegible = getTipoTransaccion(mov.tipo);
        const tipoColor = tipoLegible === 'Envío' ? 'text-danger' : tipoLegible === 'Depósito' ? 'text-success' : 'text-primary';
        const li = `
            <li class="list-group-item">
                <div>
                    <strong class="${tipoColor}">${tipoLegible}</strong><br>
                    <span>Monto: $${mov.monto}</span><br>
                    <span>Fecha: ${mov.fecha}</span><br>
                    ${mov.destino ? `<span>Destinatario: ${mov.destino}</span>` : ''}
                </div>
            </li>`;
        $lista.append(li);
    });
}

// Inicializar cuando la página cargue
$(function() {
    if ($('#listaMovimientos').length) {
        mostrarUltimosMovimientos();
    }

    // Listener del select de filtro: llama a la función requerida
    $('#filterType').on('change', function() {
        mostrarUltimosMovimientos($(this).val());
    });
});
