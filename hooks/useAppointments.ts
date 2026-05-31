'use client'

import { create } from 'zustand'
import { appointmentService, Appointment, CreateAppointmentData } from '@/services/appointment.service'

interface AppointmentsState {
  appointments: Appointment[]
  selectedAppointment: Appointment | null
  isLoading: boolean
  fetchAppointments: (role: 'client' | 'lawyer', status?: string) => Promise<void>
  fetchAppointmentById: (id: string) => Promise<void>
  createAppointment: (data: CreateAppointmentData) => Promise<Appointment>
  updateStatus: (id: string, status: Appointment['status'], reason?: string) => Promise<void>
  cancelAppointment: (id: string, reason?: string) => Promise<void>
  getUpcoming: () => Promise<Appointment[]>
  getStats: () => Promise<{ total: number; confirmed: number; pending: number; completed: number; cancelled: number }>
}

export const useAppointments = create<AppointmentsState>((set, get) => ({
  appointments: [],
  selectedAppointment: null,
  isLoading: false,

  fetchAppointments: async (role: 'client' | 'lawyer', status?: string) => {
    set({ isLoading: true })
    try {
      const appointments = await appointmentService.getMyAppointments(role, status)
      set({ appointments, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      set({ isLoading: false })
    }
  },

  fetchAppointmentById: async (id: string) => {
    set({ isLoading: true })
    try {
      const appointment = await appointmentService.getAppointmentById(id)
      set({ selectedAppointment: appointment, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch appointment:', error)
      set({ isLoading: false })
    }
  },

  createAppointment: async (data: CreateAppointmentData) => {
    set({ isLoading: true })
    try {
      const appointment = await appointmentService.createAppointment(data)
      set({ isLoading: false })
      return appointment
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  updateStatus: async (id: string, status: Appointment['status'], reason?: string) => {
    set({ isLoading: true })
    try {
      await appointmentService.updateAppointmentStatus(id, status, reason)
      // Refresh appointments list
      await get().fetchAppointments('client')
      set({ isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  cancelAppointment: async (id: string, reason?: string) => {
    set({ isLoading: true })
    try {
      await appointmentService.cancelAppointment(id, reason)
      await get().fetchAppointments('client')
      set({ isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  getUpcoming: async () => {
    try {
      return await appointmentService.getUpcomingAppointments()
    } catch (error) {
      console.error('Failed to fetch upcoming appointments:', error)
      return []
    }
  },

  getStats: async () => {
    try {
      return await appointmentService.getAppointmentStats()
    } catch (error) {
      console.error('Failed to fetch appointment stats:', error)
      return { total: 0, confirmed: 0, pending: 0, completed: 0, cancelled: 0 }
    }
  },
}))