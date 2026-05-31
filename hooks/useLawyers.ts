'use client'

import { create } from 'zustand'
import { lawyerService, Lawyer, LawyerFilters, PaginatedResponse } from '@/services/lawyer.service'

interface LawyersState {
  lawyers: Lawyer[]
  selectedLawyer: Lawyer | null
  isLoading: boolean
  totalPages: number
  currentPage: number
  filters: LawyerFilters
  specializations: string[]
  cities: string[]
  fetchLawyers: (page?: number) => Promise<void>
  fetchLawyerById: (id: string) => Promise<void>
  updateFilters: (filters: LawyerFilters) => void
  clearFilters: () => void
  loadSpecializations: () => Promise<void>
  loadCities: () => Promise<void>
}

export const useLawyers = create<LawyersState>((set, get) => ({
  lawyers: [],
  selectedLawyer: null,
  isLoading: false,
  totalPages: 0,
  currentPage: 1,
  filters: {},
  specializations: [],
  cities: [],

  fetchLawyers: async (page: number = 1) => {
    set({ isLoading: true })
    try {
      const { filters, currentPage } = get()
      const response: PaginatedResponse<Lawyer> = await lawyerService.getLawyers(
        filters,
        page || currentPage
      )
      set({
        lawyers: response.data,
        totalPages: response.pagination.totalPages,
        currentPage: response.pagination.page,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to fetch lawyers:', error)
      set({ isLoading: false })
    }
  },

  fetchLawyerById: async (id: string) => {
    set({ isLoading: true })
    try {
      const lawyer = await lawyerService.getLawyerById(id)
      set({ selectedLawyer: lawyer, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch lawyer:', error)
      set({ isLoading: false })
    }
  },

  updateFilters: (filters: LawyerFilters) => {
    set({ filters, currentPage: 1 })
    get().fetchLawyers(1)
  },

  clearFilters: () => {
    set({ filters: {}, currentPage: 1 })
    get().fetchLawyers(1)
  },

  loadSpecializations: async () => {
    try {
      const specializations = await lawyerService.getSpecializations()
      set({ specializations })
    } catch (error) {
      console.error('Failed to load specializations:', error)
    }
  },

  loadCities: async () => {
    try {
      const cities = await lawyerService.getCities()
      set({ cities })
    } catch (error) {
      console.error('Failed to load cities:', error)
    }
  },
}))