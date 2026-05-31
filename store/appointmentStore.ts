import { create } from 'zustand'

export interface Appointment {
  id: string
  client_id: string
  lawyer_id: string
  appointment_date: string
  duration_minutes: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  meeting_link?: string
  meeting_platform?: string
  notes?: string
  client_notes?: string
  lawyer_notes?: string
  fee: number
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_intent_id?: string
  created_at: string
  updated_at: string
  client?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  lawyer?: {
    id: string
    name: string
    email: string
    avatar_url?: string
    fee_per_hour: number
  }
}

export interface AppointmentFilters {
  status?: string
  startDate?: Date
  endDate?: Date
  lawyerId?: string
  clientId?: string
}

interface AppointmentState {
  appointments: Appointment[]
  currentAppointment: Appointment | null
  filters: AppointmentFilters
  isLoading: boolean
  totalCount: number
  upcomingCount: number
  pendingCount: number
  
  // Actions
  setAppointments: (appointments: Appointment[]) => void
  setCurrentAppointment: (appointment: Appointment | null) => void
  addAppointment: (appointment: Appointment) => void
  updateAppointment: (id: string, data: Partial<Appointment>) => void
  removeAppointment: (id: string) => void
  setFilters: (filters: AppointmentFilters) => void
  clearFilters: () => void
  setLoading: (isLoading: boolean) => void
  setTotalCount: (count: number) => void
  setCounts: (upcoming: number, pending: number) => void
  getAppointmentById: (id: string) => Appointment | undefined
  getAppointmentsByLawyer: (lawyerId: string) => Appointment[]
  getAppointmentsByClient: (clientId: string) => Appointment[]
  getUpcomingAppointments: () => Appointment[]
  getPendingAppointments: () => Appointment[]
  getCompletedAppointments: () => Appointment[]
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  currentAppointment: null,
  filters: {},
  isLoading: false,
  totalCount: 0,
  upcomingCount: 0,
  pendingCount: 0,

  setAppointments: (appointments) => {
    const now = new Date()
    const upcoming = appointments.filter(
      (a) => a.status === 'confirmed' && new Date(a.appointment_date) > now
    ).length
    const pending = appointments.filter((a) => a.status === 'pending').length
    
    set({ 
      appointments, 
      totalCount: appointments.length,
      upcomingCount: upcoming,
      pendingCount: pending,
    })
  },

  setCurrentAppointment: (appointment) => {
    set({ currentAppointment: appointment })
  },

  addAppointment: (appointment) => {
    set((state) => ({
      appointments: [appointment, ...state.appointments],
      totalCount: state.totalCount + 1,
    }))
  },

  updateAppointment: (id, data) => {
    set((state) => ({
      appointments: state.appointments.map((apt) =>
        apt.id === id ? { ...apt, ...data } : apt
      ),
      currentAppointment:
        state.currentAppointment?.id === id
          ? { ...state.currentAppointment, ...data }
          : state.currentAppointment,
    }))
    
    // Recalculate counts
    const { appointments } = get()
    const now = new Date()
    const upcoming = appointments.filter(
      (a) => a.status === 'confirmed' && new Date(a.appointment_date) > now
    ).length
    const pending = appointments.filter((a) => a.status === 'pending').length
    
    set({ upcomingCount: upcoming, pendingCount: pending })
  },

  removeAppointment: (id) => {
    set((state) => ({
      appointments: state.appointments.filter((apt) => apt.id !== id),
      totalCount: state.totalCount - 1,
      currentAppointment:
        state.currentAppointment?.id === id ? null : state.currentAppointment,
    }))
  },

  setFilters: (filters) => {
    set({ filters })
  },

  clearFilters: () => {
    set({ filters: {} })
  },

  setLoading: (isLoading) => {
    set({ isLoading })
  },

  setTotalCount: (count) => {
    set({ totalCount: count })
  },

  setCounts: (upcoming, pending) => {
    set({ upcomingCount: upcoming, pendingCount: pending })
  },

  getAppointmentById: (id) => {
    return get().appointments.find((apt) => apt.id === id)
  },

  getAppointmentsByLawyer: (lawyerId) => {
    return get().appointments.filter((apt) => apt.lawyer_id === lawyerId)
  },

  getAppointmentsByClient: (clientId) => {
    return get().appointments.filter((apt) => apt.client_id === clientId)
  },

  getUpcomingAppointments: () => {
    const now = new Date()
    return get().appointments.filter(
      (apt) => apt.status === 'confirmed' && new Date(apt.appointment_date) > now
    )
  },

  getPendingAppointments: () => {
    return get().appointments.filter((apt) => apt.status === 'pending')
  },

  getCompletedAppointments: () => {
    return get().appointments.filter((apt) => apt.status === 'completed')
  },
}))