import client from './client';

// ── Auth ────────────────────────────────────────────────
export const authAPI = {
  register: (data)          => client.post('/auth/register', data),
  login:    (data)          => client.post('/auth/login', data),
  profile:  ()              => client.get('/auth/profile'),
  update:   (data)          => client.put('/auth/profile', data),
  changePassword: (data)    => client.put('/auth/change-password', data),
  forgotPassword: (email)   => client.post('/auth/forgot-password', { email }),
  resetPassword:  (token, password) => client.post(`/auth/reset-password/${token}`, { password }),
  getAddresses:   ()        => client.get('/auth/addresses'),
  addAddress:     (data)    => client.post('/auth/addresses', data),
  updateAddress:  (id, data)=> client.put(`/auth/addresses/${id}`, data),
  deleteAddress:  (id)      => client.delete(`/auth/addresses/${id}`),
  setDefault:     (id)      => client.put(`/auth/addresses/${id}/default`),
  uploadAvatar:   (form)    => client.put('/auth/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ── Products ────────────────────────────────────────────
export const productAPI = {
  getAll:   (params) => client.get('/products', { params }),
  getBySlug:(slug)   => client.get(`/products/${slug}`),
  addReview:(id, data) => client.post(`/products/${id}/reviews`, data),
};

// ── Cart ────────────────────────────────────────────────
export const cartAPI = {
  get:    ()                        => client.get('/cart'),
  add:    (data)                    => client.post('/cart', data),
  update: (itemId, quantity)        => client.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId)                  => client.delete(`/cart/${itemId}`),
};

// ── Orders ──────────────────────────────────────────────
export const orderAPI = {
  create:   (data) => client.post('/order', data),
  myOrders: ()     => client.get('/order/my-orders'),
  getById:  (id)   => client.get(`/order/${id}`),
  cancel:   (id)   => client.put(`/order/${id}/cancel`),
};

// ── Payments ────────────────────────────────────────────
export const paymentAPI = {
  createStripeIntent: (orderId) => client.post('/payments/stripe/create-payment-intent', { orderId }),
  mpesaPush:          (data)    => client.post('/payments/mpesa/stkpush', data),
};

// ── Coupons ─────────────────────────────────────────────
export const couponAPI = {
  validate: (code, amount) => client.post('/coupons/validate', { code, amount }),
};

// ── Wishlist ────────────────────────────────────────────
export const wishlistAPI = {
  get:    ()          => client.get('/wishlist'),
  toggle: (productId) => client.post('/wishlist', { productId }),
};
