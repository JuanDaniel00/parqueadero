// /services/apiClient.js
import { apiClient } from '../plugins/axios.js'; // Importa tu instancia de Axios si está configurada en /plugins

// Función GET
export async function getData(url, params = {}) {
    try {
        const response = await apiClient.get(url, { params });
        return response.data;  // Devuelve los datos de la respuesta
    } catch (error) {
        console.error('Error en la petición GET:', error);
        throw error;  // Opcionalmente, puedes manejar el error o lanzarlo
    }
}

// Función POST
export async function postData(url, data) {
    try {
        const response = await apiClient.post(url, data);
        return response.data;  // Devuelve los datos de la respuesta
    } catch (error) {
        console.error('Error en la petición POST:', error);
        throw error;
    }
}

// Función PUT
export async function putData(url, data) {
    try {
        const response = await apiClient.put(url, data);
        return response.data;  // Devuelve los datos de la respuesta
    } catch (error) {
        console.error('Error en la petición PUT:', error);
        throw error;
    }
}