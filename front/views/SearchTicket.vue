<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTicketStore } from '../stores/ticketStore';
import { useNotify } from '../utils/notify';

const router = useRouter();
const ticketStore = useTicketStore();
const notify = useNotify();

const searchPlaca = ref('');
const selectedTicket = ref(null);

// Cargar tickets al montar el componente
onMounted(async () => {
    try {
        await ticketStore.loadTickets();
    } catch (error) {
        notify.error('Error al cargar los tickets');
    }
});

// Buscar ticket por placa
const searchTicket = () => {
    if (!searchPlaca.value.trim()) {
        notify.error('Ingresa una placa para buscar');
        return;
    }

    const ticket = ticketStore.getActiveTicketByPlaca(searchPlaca.value.toUpperCase().trim());

    if (ticket) {
        selectedTicket.value = ticket;
    } else {
        selectedTicket.value = null;
        notify.info('No se encontró un ticket activo para esta placa');
    }
};

// Calcular el precio del ticket
const calculatePrice = computed(() => {
    if (!selectedTicket.value) return 0;

    const ticket = selectedTicket.value;
    const entryDateTime = new Date(`${ticket.fechaEntrada}T${ticket.horaEntrada}`);
    const now = new Date();

    if (ticket.esNoche) {
        // Calcular precio nocturno basado en hora de salida
        const exitHour = now.getHours();

        if (exitHour <= 8) {
            return 10000; // Hasta las 8am
        } else if (exitHour <= 9) {
            return 12000; // Hasta las 9am  
        } else if (exitHour <= 11) {
            return 15000; // Hasta las 11am
        } else {
            // Después de las 11am se cobra como horas normales desde las 8am
            const hoursAfter8am = exitHour - 8;
            return 15000 + (hoursAfter8am * 2500);
        }
    } else {
        // Calcular precio por horas
        const diffInMs = now - entryDateTime;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        if (diffInMinutes <= 10) {
            // Primeros 10 minutos: fracción del precio de la hora
            return Math.ceil((diffInMinutes / 60) * 2500);
        } else {
            // Después de 10 minutos: cada hora completa
            const hours = Math.ceil(diffInMinutes / 60);
            return hours * 2500;
        }
    }
});

// Formatear tiempo transcurrido
const timeElapsed = computed(() => {
    if (!selectedTicket.value) return '';

    const entryDateTime = new Date(`${selectedTicket.value.fechaEntrada}T${selectedTicket.value.horaEntrada}`);
    const now = new Date();
    const diffInMs = now - entryDateTime;

    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
});

// Marcar ticket como pagado
const markAsPaid = async () => {
    if (selectedTicket.value) {
        try {
            await ticketStore.markTicketAsPaid(selectedTicket.value.id);
            notify.success('Ticket marcado como pagado');
            selectedTicket.value = null;
            searchPlaca.value = '';
        } catch (error) {
            notify.error('Error al marcar ticket como pagado: ' + error.message);
        }
    }
};

const goBack = () => {
    router.push('/');
};

// Limpiar búsqueda
const clearSearch = () => {
    searchPlaca.value = '';
    selectedTicket.value = null;
};
</script>

<template>
    <div class="search-ticket-container">
        <div class="form-container">
            <div class="header">
                <q-btn flat round icon="arrow_back" color="primary" @click="goBack" class="back-btn" />
                <h2 class="form-title">Consultar Ticket</h2>
            </div>

            <!-- Formulario de búsqueda -->
            <div class="search-section">
                <div class="search-form">
                    <q-input v-model="searchPlaca" outlined placeholder="Ingresa la placa del vehículo"
                        class="search-input" maxlength="10" @keyup.enter="searchTicket">
                        <template v-slot:append>
                            <q-btn flat round icon="search" color="primary" @click="searchTicket" />
                        </template>
                    </q-input>
                </div>

                <div class="search-actions">
                    <q-btn color="primary" size="lg" icon="search" @click="searchTicket" class="search-btn">
                        Buscar Ticket
                    </q-btn>

                    <q-btn flat color="grey-6" @click="clearSearch" class="clear-btn">
                        Limpiar
                    </q-btn>
                </div>
            </div>

            <!-- Resultado del ticket -->
            <div v-if="selectedTicket" class="ticket-result">
                <q-card class="ticket-card">
                    <q-card-section class="ticket-header">
                        <h3 class="ticket-title">Información del Ticket</h3>
                        <q-chip :color="selectedTicket.esNoche ? 'purple' : 'blue'" text-color="white"
                            icon="local_parking">
                            {{ selectedTicket.esNoche ? 'Estacionamiento Nocturno' : 'Estacionamiento por Horas' }}
                        </q-chip>
                    </q-card-section>

                    <q-card-section class="ticket-details">
                        <div class="detail-row">
                            <span class="detail-label">Placa:</span>
                            <span class="detail-value">{{ selectedTicket.placa }}</span>
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">Fecha de Entrada:</span>
                            <span class="detail-value">{{ selectedTicket.fechaEntrada }}</span>
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">Hora de Entrada:</span>
                            <span class="detail-value">{{ selectedTicket.horaEntrada }}</span>
                        </div>

                        <div v-if="selectedTicket.numeroEstacionamiento" class="detail-row">
                            <span class="detail-label">Estacionamiento:</span>
                            <span class="detail-value">{{ selectedTicket.numeroEstacionamiento }}</span>
                        </div>

                        <div v-if="selectedTicket.hotel" class="detail-row">
                            <span class="detail-label">Hotel:</span>
                            <span class="detail-value">{{ selectedTicket.hotel }}</span>
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">Tiempo Transcurrido:</span>
                            <span class="detail-value time-elapsed">{{ timeElapsed }}</span>
                        </div>
                    </q-card-section>

                    <q-card-section class="price-section">
                        <div class="price-container">
                            <span class="price-label">Total a Pagar:</span>
                            <span class="price-value">${{ calculatePrice.toLocaleString() }} COP</span>
                        </div>

                        <div v-if="selectedTicket.esNoche" class="price-info">
                            <small class="text-grey-6">
                                * Tarifa nocturna: $10,000 (hasta 8am), $12,000 (hasta 9am), $15,000 (hasta 11am)
                            </small>
                        </div>
                        <div v-else class="price-info">
                            <small class="text-grey-6">
                                * Tarifa por horas: $2,500/hora. Primeros 10 min: fracción de hora
                            </small>
                        </div>
                    </q-card-section>

                    <q-card-actions class="ticket-actions">
                        <q-btn color="green" size="lg" icon="payment" @click="markAsPaid" class="paid-btn"
                            :loading="ticketStore.loading" :disable="ticketStore.loading">
                            Marcar como Pagado
                        </q-btn>
                    </q-card-actions>
                </q-card>
            </div>

            <!-- Mensaje cuando no hay ticket -->
            <div v-else-if="searchPlaca" class="no-ticket">
                <q-icon name="info" size="60px" color="grey-5" />
                <p class="no-ticket-text">No se encontró un ticket activo para la placa: <strong>{{
                    searchPlaca.toUpperCase()
                }}</strong></p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.search-ticket-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 40px;
}

.form-container {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    padding: 40px;
    max-width: 700px;
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

.search-section {
    margin-bottom: 30px;
}

.search-form {
    margin-bottom: 20px;
}

.search-input {
    border-radius: 10px;
}

.search-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.search-btn {
    padding: 12px 30px;
    border-radius: 10px;
    font-weight: bold;
}

.clear-btn {
    border-radius: 10px;
}

.ticket-result {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.ticket-card {
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.ticket-header {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.ticket-title {
    margin: 0;
    font-size: 1.3rem;
}

.ticket-details {
    padding: 25px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-label {
    font-weight: 600;
    color: #666;
}

.detail-value {
    font-weight: 500;
    color: #333;
}

.time-elapsed {
    color: #1976D2;
    font-weight: bold;
}

.price-section {
    background: #f8f9fa;
    text-align: center;
    padding: 25px;
}

.price-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.price-label {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
}

.price-value {
    font-size: 1.8rem;
    font-weight: bold;
    color: #2E7D32;
}

.price-info {
    margin-top: 10px;
}

.ticket-actions {
    padding: 20px 25px;
    justify-content: center;
}

.paid-btn {
    padding: 12px 40px;
    border-radius: 10px;
    font-weight: bold;
    font-size: 1.1rem;
}

.no-ticket {
    text-align: center;
    padding: 40px 20px;
    color: #666;
}

.no-ticket-text {
    font-size: 1.1rem;
    margin-top: 20px;
}

@media (max-width: 600px) {
    .form-container {
        padding: 20px;
        margin: 10px;
    }

    .search-actions {
        flex-direction: column;
    }

    .price-container {
        flex-direction: column;
        gap: 10px;
    }

    .form-title {
        font-size: 1.5rem;
    }
}
</style>
