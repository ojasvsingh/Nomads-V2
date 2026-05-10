import { create } from 'zustand'


//global store that hols user info and the jwt token recieved after login
const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,

    setAuth: (user,token) => {
        localStorage.setItem('token',token)
        set({user, token})
    },

    logout: () => {
        localStorage.removeItem('token')
        set({user:null, token:null})
    }
}))

export default useAuthStore