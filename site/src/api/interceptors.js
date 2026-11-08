
export function setupInterceptors(client) {
  client.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem("access_token");

      if (token) {
        config.headers.set(
          "Authorization",
          `Bearer ${token}`
        );
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );
}
