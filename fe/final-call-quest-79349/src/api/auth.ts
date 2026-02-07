import api from './axios';

export interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  picture: string;
}

export const authApi = {
  async googleLogin(credential: string) {
    const response = await api.post('/auth/google', { credential });
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};


