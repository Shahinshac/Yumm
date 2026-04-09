import api from './api';

export const customerService = {
  // Get all approved restaurants
  getRestaurants: async () => {
    const resp = await api.get('/customer/restaurants');
    return resp.data;
  },

  // Get restaurant details and menu
  getRestaurantDetails: async (id) => {
    const resp = await api.get(`/customer/restaurants/${id}`);
    return resp.data;
  },

  // Place a new order
  placeOrder: async (orderData) => {
    const resp = await api.post('/customer/orders/place', orderData);
    return resp.data;
  },

  // Get customer's orders
  getMyOrders: async () => {
    const resp = await api.get('/customer/orders');
    return resp.data;
  },

  // Get specific order details
  getOrderDetails: async (id) => {
    const resp = await api.get(`/customer/orders/${id}`);
    return resp.data;
  },

  // Cancel an order
  cancelOrder: async (id) => {
    const resp = await api.post(`/customer/orders/${id}/cancel`);
    return resp.data;
  }
};
