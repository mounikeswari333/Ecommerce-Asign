import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ps_admin');
    const token = localStorage.getItem('ps_token');
    if (stored && token) {
      setAdmin(JSON.parse(stored));
      // Set default authorization header for axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('ps_token', token);
        localStorage.setItem('ps_admin', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setAdmin(user);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      console.error('Admin login error:', err);
      // Fallback for mock environment if server is not running
      if (email === 'admin@pashusevak.com' && password === 'Admin@123') {
        const mockUser = { id: 'admin-001', name: 'Super Admin', email: 'admin@pashusevak.com', role: 'super_admin' };
        localStorage.setItem('ps_token', 'mock-token');
        localStorage.setItem('ps_admin', JSON.stringify(mockUser));
        setAdmin(mockUser);
        return { success: true };
      }
      return { success: false, message: err.response?.data?.message || 'Server connection failed' };
    }
  };

  const loginBuyer = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login-buyer`, { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('ps_token', token);
        localStorage.setItem('ps_admin', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setAdmin(user);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      console.error('Buyer login error:', err);
      // Mock fallback
      if (email === 'buyer@pashusevak.com' && password === 'Buyer@123') {
        const mockBuyer = { id: '60d5ec49f3e4981e4881e001', name: 'Amit Buyer', email: 'buyer@pashusevak.com', role: 'buyer', buyerId: 'PSPK-B-00001', addresses: [{ label: 'Home', line1: '123 Sweet Cow Colony', city: 'Pune', state: 'Maharashtra', pincode: '411001', isDefault: true }] };
        localStorage.setItem('ps_token', 'mock-token');
        localStorage.setItem('ps_admin', JSON.stringify(mockBuyer));
        setAdmin(mockBuyer);
        return { success: true };
      }
      return { success: false, message: err.response?.data?.message || 'Server connection failed' };
    }
  };

  const loginSeller = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login-seller`, { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('ps_token', token);
        localStorage.setItem('ps_admin', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setAdmin(user);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      console.error('Seller login error:', err);
      // Mock fallback
      if (email === 'seller@pashusevak.com' && password === 'Seller@123') {
        const mockSeller = { id: '60d5ec49f3e4981e4881e002', name: 'Ravi Seller', businessName: 'Gau Kripa Dairy', email: 'seller@pashusevak.com', role: 'seller', sellerId: 'PSPK-S-00001' };
        localStorage.setItem('ps_token', 'mock-token');
        localStorage.setItem('ps_admin', JSON.stringify(mockSeller));
        setAdmin(mockSeller);
        return { success: true };
      }
      return { success: false, message: err.response?.data?.message || 'Server connection failed' };
    }
  };

  const registerBuyer = async (buyerData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register-buyer`, buyerData);
      return res.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('ps_token');
    localStorage.removeItem('ps_admin');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  const canAccess = (requiredRoles) => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    return requiredRoles.includes(admin.role);
  };

  return (
    <AuthContext.Provider value={{ admin, user: admin, loading, login, loginBuyer, loginSeller, registerBuyer, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
