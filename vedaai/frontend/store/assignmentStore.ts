import { create } from 'zustand'
import { Assignment, JobStatus } from '@/types'

interface AssignmentStore {
  assignments: Assignment[]
  currentAssignment: Assignment | null
  jobStatus: JobStatus | null
  isLoading: boolean
  error: string | null
  searchQuery: string
  totalCount: number

  setAssignments: (assignments: Assignment[]) => void
  addAssignment: (assignment: Assignment) => void
  updateAssignment: (id: string, data: Partial<Assignment>) => void
  removeAssignment: (id: string) => void
  setCurrentAssignment: (assignment: Assignment | null) => void
  setJobStatus: (status: JobStatus | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  setTotalCount: (count: number) => void
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  currentAssignment: null,
  jobStatus: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  totalCount: 0,

  setAssignments: (assignments) => set({ assignments }),
  addAssignment: (assignment) =>
    set((state) => ({
      assignments: [assignment, ...state.assignments],
      totalCount: state.totalCount + 1,
    })),
  updateAssignment: (id, data) =>
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a._id === id ? { ...a, ...data } : a
      ),
      currentAssignment:
        state.currentAssignment?._id === id
          ? { ...state.currentAssignment, ...data }
          : state.currentAssignment,
    })),
  removeAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter((a) => a._id !== id),
      totalCount: Math.max(0, state.totalCount - 1),
    })),
  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),
  setJobStatus: (status) => set({ jobStatus: status }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTotalCount: (count) => set({ totalCount: count }),
}))
