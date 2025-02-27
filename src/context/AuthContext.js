import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// Custom hook to access the AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const storedUserData = JSON.parse(localStorage.getItem('userData'));
        if (token) {
            setUser({ token });
            if (storedUserData) {
                setUserData(storedUserData);
            }
        }
    }, []);

    const login = (roleType, token) => {
        localStorage.setItem('authToken', token);
        setUser({ token });
    };

    const UserInfo = (name, roleType, role) => {
        const userData = { name, roleType, role };
        setUserData(userData);
        console.log(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
    };

    const logoutFunction = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUser(null);
        setUserData({});
    };

    const value = {
        UserInfo,
        user,
        userData,
        login,
        logoutFunction,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};