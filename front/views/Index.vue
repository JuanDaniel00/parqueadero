<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToAddTicket = () => {
    router.push('/add-ticket');
};

const goToSearchTicket = () => {
    router.push('/search-ticket');
};
</script>

<template>
    <div class="parking-container">
        <div class="header">
            <h1 class="title">Sistema de Tickets de Parqueadero</h1>
        </div>

        <div class="menu-buttons">
            <q-btn class="menu-btn add-btn" size="lg" color="primary" @click="goToAddTicket" icon="add_circle">
                Añadir Ticket
            </q-btn>

            <q-btn class="menu-btn search-btn" size="lg" color="secondary" @click="goToSearchTicket" icon="search">
                Consultar Ticket
            </q-btn>
        </div>
    </div>
</template>


<style scoped>
.parking-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.header {
    text-align: center;
    margin-bottom: 60px;
}

.title {
    color: white;
    font-size: 3rem;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    margin: 0;
}

.menu-buttons {
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
    justify-content: center;
}

.menu-btn {
    padding: 20px 40px;
    font-size: 1.2rem;
    font-weight: bold;
    min-width: 200px;
    min-height: 80px;
    border-radius: 15px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.menu-btn:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.add-btn {
    background: linear-gradient(45deg, #4CAF50, #45a049);
}

.search-btn {
    background: linear-gradient(45deg, #2196F3, #1976D2);
}

@media (max-width: 600px) {
    .title {
        font-size: 2rem;
    }

    .menu-buttons {
        flex-direction: column;
        gap: 20px;
    }

    .menu-btn {
        min-width: 280px;
    }
}
</style>