<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTicketStore } from '../stores/ticketStore';
import { useNotify } from '../utils/notify';

const router = useRouter();
const ticketStore = useTicketStore();
const notify = useNotify();

// Datos del formulario
const placa = ref('');
const numeroEstacionamiento = ref('');
const hotel = ref('');
const esNoche = ref(false);

// Función para obtener fecha y hora actual
const getCurrentDateTime = () => {
    const now = new Date();
    return {
        fecha: now.toISOString().split('T')[0],
        hora: now.toTimeString().split(' ')[0].substring(0, 5)
    };
};

// Inicializar con fecha y hora actual
const { fecha, hora } = getCurrentDateTime();
const fechaEntrada = ref(fecha);
const horaEntrada = ref(hora);

// Función para usar fecha y hora actual
const useCurrentDateTime = () => {
    const { fecha, hora } = getCurrentDateTime();
    fechaEntrada.value = fecha;
    horaEntrada.value = hora;
};

// Función para crear el ticket
const createTicket = async () => {
    if (!placa.value.trim()) {
        notify.error('La placa es obligatoria');
        return;
    }

    if (!fechaEntrada.value || !horaEntrada.value) {
        notify.error('La fecha y hora son obligatorias');
        return;
    }

    const ticket = {
        placa: placa.value.toUpperCase().trim(),
        fechaEntrada: fechaEntrada.value,
        horaEntrada: horaEntrada.value,
        numeroEstacionamiento: numeroEstacionamiento.value.trim() || null,
        hotel: hotel.value.trim() || null,
        esNoche: esNoche.value
    };

    try {
        await ticketStore.addTicket(ticket);
        notify.success('Ticket creado exitosamente');

        // Limpiar formulario
        placa.value = '';
        numeroEstacionamiento.value = '';
        hotel.value = '';
        esNoche.value = false;
        const { fecha, hora } = getCurrentDateTime();
        fechaEntrada.value = fecha;
        horaEntrada.value = hora;

    } catch (error) {
        notify.error('Error al crear el ticket: ' + error.message);
    }
}; const goBack = () => {
    router.push('/');
};
</script>

<template>
    <div class="add-ticket-container">
        <div class="form-container">
            <div class="header">
                <q-btn flat round icon="arrow_back" color="primary" @click="goBack" class="back-btn" />
                <h2 class="form-title">Añadir Nuevo Ticket</h2>
            </div>

            <q-form @submit="createTicket" class="ticket-form">
                <!-- Placa -->
                <div class="form-group">
                    <label class="form-label">Placa del Vehículo *</label>
                    <q-input v-model="placa" outlined placeholder="Ej: ABC123" class="form-input"
                        :rules="[val => !!val || 'La placa es obligatoria']" maxlength="10" />
                </div>

                <!-- Fecha y Hora -->
                <div class="form-row">
                    <div class="form-group flex-1">
                        <label class="form-label">Fecha de Entrada *</label>
                        <q-input v-model="fechaEntrada" outlined type="date" class="form-input" />
                    </div>

                    <div class="form-group flex-1">
                        <label class="form-label">Hora de Entrada *</label>
                        <q-input v-model="horaEntrada" outlined type="time" class="form-input" />
                    </div>
                </div>

                <!-- Botón para usar fecha/hora actual -->
                <div class="current-time-btn-container">
                    <q-btn flat color="primary" icon="access_time" label="Usar fecha y hora actual"
                        @click="useCurrentDateTime" class="current-time-btn" />
                </div>

                <!-- Número de estacionamiento -->
                <div class="form-group">
                    <label class="form-label">Número de Estacionamiento (Opcional)</label>
                    <q-input v-model="numeroEstacionamiento" outlined placeholder="Ej: A-12" class="form-input"
                        maxlength="10" />
                </div>

                <!-- Hotel -->
                <div class="form-group">
                    <label class="form-label">Hotel de Origen (Opcional)</label>
                    <q-input v-model="hotel" outlined placeholder="Nombre del hotel" class="form-input" />
                </div>

                <!-- Checkbox para estadía nocturna -->
                <div class="form-group">
                    <q-checkbox v-model="esNoche" label="Se quedará toda la noche" color="primary"
                        class="night-checkbox" />
                    <div class="checkbox-info">
                        <small class="text-grey-6">
                            Si marcas esta opción, se aplicarán las tarifas nocturnas
                        </small>
                    </div>
                </div>

                <!-- Botones de acción -->
                <div class="form-actions">
                    <q-btn type="button" color="grey-6" outline size="lg" @click="goBack" class="action-btn">
                        Cancelar
                    </q-btn>

                    <q-btn type="submit" color="primary" size="lg" icon="add" class="action-btn"
                        :loading="ticketStore.loading" :disable="ticketStore.loading">
                        Crear Ticket
                    </q-btn>
                </div>
            </q-form>
        </div>
    </div>
</template>

<style scoped>
.add-ticket-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.form-container {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    padding: 40px;
    max-width: 600px;
    width: 100%;
}

.header {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
}

.back-btn {
    margin-right: 15px;
}

.form-title {
    color: #333;
    font-size: 1.8rem;
    font-weight: bold;
    margin: 0;
}

.ticket-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-row {
    display: flex;
    gap: 15px;
}

.flex-1 {
    flex: 1;
}

.form-label {
    color: #555;
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 0.95rem;
}

.form-input {
    border-radius: 10px;
}

.current-time-btn-container {
    display: flex;
    justify-content: center;
    margin: -10px 0 10px 0;
}

.current-time-btn {
    border-radius: 20px;
    padding: 8px 20px;
}

.night-checkbox {
    font-weight: 500;
    color: #333;
}

.checkbox-info {
    margin-top: 5px;
}

.form-actions {
    display: flex;
    gap: 15px;
    margin-top: 20px;
}

.action-btn {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    font-weight: bold;
}

@media (max-width: 600px) {
    .form-container {
        padding: 20px;
        margin: 10px;
    }

    .form-row {
        flex-direction: column;
        gap: 20px;
    }

    .form-actions {
        flex-direction: column;
    }

    .form-title {
        font-size: 1.5rem;
    }
}
</style>
