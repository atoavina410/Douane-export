export function getToken() {
  return localStorage.getItem("svo_token");
}

export function getUser() {
  const data = localStorage.getItem("svo_user");
  return data ? JSON.parse(data) : null;
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem("svo_access");
  localStorage.removeItem("svo_refresh");
  localStorage.removeItem("svo_user");

  window.location.href = "/"; // redirection propre
}

