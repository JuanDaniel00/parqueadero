import { defineStore } from "pinia";
import { supabaseClient } from "../services/supabase.js";

export const useTicketStore = defineStore("ticket", {
  state: () => ({
    tickets: [],
    loading: false,
    error: null,
  }),

  getters: {
    // Obtener tickets activos
    activeTickets: (state) => {
      return state.tickets.filter((ticket) => ticket.estado === "activo");
    },

    // Obtener tickets pagados
    paidTickets: (state) => {
      return state.tickets.filter((ticket) => ticket.estado === "pagado");
    },

    // Obtener ticket activo por placa
    getActiveTicketByPlaca: (state) => {
      return (placa) => {
        return state.tickets.find(
          (ticket) =>
            ticket.placa.toLowerCase() === placa.toLowerCase() &&
            ticket.estado === "activo"
        );
      };
    },

    // Obtener todos los tickets de una placa
    getTicketsByPlaca: (state) => {
      return (placa) => {
        return state.tickets.filter(
          (ticket) => ticket.placa.toLowerCase() === placa.toLowerCase()
        );
      };
    },
  },

  actions: {
    // Cargar todos los tickets desde Supabase
    async loadTickets() {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabaseClient
          .from("tickets")
          .select("*");

        if (error) {
          throw error;
        }

        // Convertir nombres de columnas de snake_case a camelCase
        this.tickets = data.map((ticket) => ({
          id: ticket.id,
          placa: ticket.placa,
          fechaEntrada: ticket.fecha_entrada,
          horaEntrada: ticket.hora_entrada,
          numeroEstacionamiento: ticket.numero_estacionamiento,
          hotel: ticket.hotel,
          esNoche: ticket.es_noche,
          estado: ticket.estado,
          fechaCreacion: ticket.fecha_creacion,
          fechaPago: ticket.fecha_pago,
        }));
      } catch (error) {
        this.error = error.message;
        console.error("Error loading tickets:", error);
      } finally {
        this.loading = false;
      }
    },

    // Añadir nuevo ticket
    async addTicket(ticketData) {
      // Verificar si ya existe un ticket activo para esta placa
      const existingActiveTicket = this.getActiveTicketByPlaca(
        ticketData.placa
      );

      if (existingActiveTicket) {
        throw new Error(
          `Ya existe un ticket activo para la placa ${ticketData.placa}`
        );
      }

      this.loading = true;
      this.error = null;

      try {
        // Convertir datos a formato de base de datos (snake_case)
        const dbTicket = {
          placa: ticketData.placa.toUpperCase(),
          fecha_entrada: ticketData.fechaEntrada,
          hora_entrada: ticketData.horaEntrada,
          numero_estacionamiento: ticketData.numeroEstacionamiento,
          hotel: ticketData.hotel,
          es_noche: ticketData.esNoche,
          estado: "activo",
        };

        const { data, error } = await supabaseClient
          .from("tickets")
          .insert(dbTicket)
          .select();

        if (error) {
          throw error;
        }

        // Recargar tickets para obtener el nuevo
        await this.loadTickets();

        return data ? data[0] : null;
      } catch (error) {
        this.error = error.message;
        console.error("Error adding ticket:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Marcar ticket como pagado
    async markTicketAsPaid(ticketId) {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabaseClient
          .from("tickets")
          .update({
            estado: "pagado",
            fecha_pago: new Date().toISOString(),
          })
          .eq("id", ticketId);

        if (error) {
          throw error;
        }

        // Actualizar el ticket local
        const ticket = this.tickets.find((t) => t.id === ticketId);
        if (ticket) {
          ticket.estado = "pagado";
          ticket.fechaPago = new Date().toISOString();
        }

        return ticket;
      } catch (error) {
        this.error = error.message;
        console.error("Error marking ticket as paid:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Eliminar ticket
    async deleteTicket(ticketId) {
      this.loading = true;
      this.error = null;

      try {
        const { error } = await supabaseClient
          .from("tickets")
          .delete()
          .eq("id", ticketId);

        if (error) {
          throw error;
        }

        // Remover del estado local
        const index = this.tickets.findIndex((t) => t.id === ticketId);
        if (index !== -1) {
          this.tickets.splice(index, 1);
        }

        return true;
      } catch (error) {
        this.error = error.message;
        console.error("Error deleting ticket:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Obtener estadísticas básicas
    getStats() {
      const total = this.tickets.length;
      const active = this.activeTickets.length;
      const paid = this.paidTickets.length;

      const totalRevenue = this.paidTickets.reduce((sum, ticket) => {
        return sum + this.calculateTicketPrice(ticket);
      }, 0);

      return {
        total,
        active,
        paid,
        totalRevenue,
      };
    },

    // Calcular precio de un ticket (método auxiliar)
    calculateTicketPrice(ticket) {
      const entryDateTime = new Date(
        `${ticket.fechaEntrada}T${ticket.horaEntrada}`
      );
      const exitDateTime = ticket.fechaPago
        ? new Date(ticket.fechaPago)
        : new Date();

      if (ticket.esNoche) {
        const exitHour = exitDateTime.getHours();

        if (exitHour <= 8) {
          return 10000;
        } else if (exitHour <= 9) {
          return 12000;
        } else if (exitHour <= 11) {
          return 15000;
        } else {
          const hoursAfter8am = exitHour - 8;
          return 15000 + hoursAfter8am * 2500;
        }
      } else {
        const diffInMs = exitDateTime - entryDateTime;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        if (diffInMinutes <= 10) {
          return Math.ceil((diffInMinutes / 60) * 2500);
        } else {
          const hours = Math.ceil(diffInMinutes / 60);
          return hours * 2500;
        }
      }
    },
  },
});
