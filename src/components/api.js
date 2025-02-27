import axios from "axios";
// import { createBrowserHistory } from "history";

// Create a custom history object for navigation
// const history = createBrowserHistory();

const api = axios.create({
  // baseURL: 'https://dresscode-unique.onrender.com', //Old
  //baseURL: "https://dresscode-updated.onrender.com", //Test
  //baseURL: "https://dresscode-bck.onrender.com",    //Production

  //new bck

  // baseURL: "https://dresscode-bck-final.onrender.com",
  baseURL: "https://dresscode-bck-bfj7.onrender.com",

  // baseURL: "https://a953-2405-201-c404-293c-912e-bb0-8e4c-93f1.ngrok-free.app" //Local
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle 401: Token Invalid/Expired
      localStorage.removeItem("authToken"); // Clear token
      localStorage.removeItem("userData"); // Clear userData
      window.location.href = "/login"; // Redirect to login screen
    }
    return Promise.reject(error);
  }
);



export default api;
