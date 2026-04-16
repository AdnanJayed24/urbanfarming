module.exports = {
  openapi: "3.0.3",
  info: {
    title: "Urban Farming Platform API",
    version: "1.0.0",
    description: "Backend API for authentication, rentals, marketplace, certifications, community, plant tracking, and admin workflows."
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development server"
    }
  ],
  tags: [
    { name: "Auth" },
    { name: "Vendors" },
    { name: "Marketplace" },
    { name: "Rentals" },
    { name: "Orders" },
    { name: "Plants" },
    { name: "Community" },
    { name: "Admin" },
    { name: "Metrics" }
  ],
  paths: {
    "/health": { get: { tags: ["Metrics"], summary: "Health check" } },
    "/api/v1/auth/register/customer": { post: { tags: ["Auth"], summary: "Register a customer" } },
    "/api/v1/auth/register/vendor": { post: { tags: ["Auth"], summary: "Register a vendor" } },
    "/api/v1/auth/login": { post: { tags: ["Auth"], summary: "Authenticate user and return JWT" } },
    "/api/v1/auth/me": { get: { tags: ["Auth"], summary: "Fetch current user profile" } },
    "/api/v1/vendors": { get: { tags: ["Vendors"], summary: "List approved vendors" } },
    "/api/v1/vendors/me/profile": {
      get: { tags: ["Vendors"], summary: "Get vendor profile" },
      patch: { tags: ["Vendors"], summary: "Update vendor profile" }
    },
    "/api/v1/vendors/me/certifications": {
      get: { tags: ["Vendors"], summary: "List vendor certifications" },
      post: { tags: ["Vendors"], summary: "Submit sustainability certification" }
    },
    "/api/v1/produce": {
      get: { tags: ["Marketplace"], summary: "List approved produce with pagination and filters" },
      post: { tags: ["Marketplace"], summary: "Create produce listing" }
    },
    "/api/v1/produce/{id}": {
      get: { tags: ["Marketplace"], summary: "Fetch produce details" },
      patch: { tags: ["Marketplace"], summary: "Update produce listing" }
    },
    "/api/v1/rentals": {
      get: { tags: ["Rentals"], summary: "Search rental spaces" },
      post: { tags: ["Rentals"], summary: "Create rental space" }
    },
    "/api/v1/rentals/{id}": { patch: { tags: ["Rentals"], summary: "Update rental space" } },
    "/api/v1/rentals/{id}/bookings": { post: { tags: ["Rentals"], summary: "Book a rental space" } },
    "/api/v1/rentals/bookings": { get: { tags: ["Rentals"], summary: "List rental bookings by role" } },
    "/api/v1/orders": {
      get: { tags: ["Orders"], summary: "List orders with pagination" },
      post: { tags: ["Orders"], summary: "Create marketplace order" }
    },
    "/api/v1/orders/{id}/status": { patch: { tags: ["Orders"], summary: "Update order status" } },
    "/api/v1/plants": {
      get: { tags: ["Plants"], summary: "List plant tracking records" },
      post: { tags: ["Plants"], summary: "Create plant tracking record" }
    },
    "/api/v1/plants/{id}": { patch: { tags: ["Plants"], summary: "Update plant tracking record" } },
    "/api/v1/plants/stream": { get: { tags: ["Plants"], summary: "Subscribe to real-time plant updates via SSE" } },
    "/api/v1/community/posts": {
      get: { tags: ["Community"], summary: "List community posts" },
      post: { tags: ["Community"], summary: "Create community post" }
    },
    "/api/v1/community/posts/{id}": {
      get: { tags: ["Community"], summary: "Get community post" },
      patch: { tags: ["Community"], summary: "Update community post" },
      delete: { tags: ["Community"], summary: "Delete community post" }
    },
    "/api/v1/admin/dashboard": { get: { tags: ["Admin"], summary: "Admin dashboard summary" } },
    "/api/v1/admin/vendors/pending": { get: { tags: ["Admin"], summary: "List pending vendors" } },
    "/api/v1/admin/vendors/{vendorProfileId}/approval": { patch: { tags: ["Admin"], summary: "Approve or reject vendor" } },
    "/api/v1/admin/certifications/pending": { get: { tags: ["Admin"], summary: "List pending certifications" } },
    "/api/v1/admin/certifications/{certId}/review": { patch: { tags: ["Admin"], summary: "Review sustainability certification" } },
    "/api/v1/admin/produce/{produceId}/review": { patch: { tags: ["Admin"], summary: "Approve or reject produce listing" } },
    "/api/v1/metrics/benchmark": { get: { tags: ["Metrics"], summary: "Return benchmark timing report" } }
  }
};
