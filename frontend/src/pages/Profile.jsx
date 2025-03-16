import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import './Profile.scss';

const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No authentication token found');
            setLoading(false);
                return;
                }

                const response = await axios.get(`${API_URL}/api/users/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data && response.data.user && response.data.user.name) {
                    setUserName(response.data.user.name);
                } else {
                    setError('User name not found in response');
                }
                setLoading(false);
        } catch (error) {
                console.error('Error fetching user profile:', error);
                setError(error.response?.data?.message || 'Failed to fetch user profile');
                setLoading(false);
                toast.error('Failed to load profile');
            }
        };

        fetchUserName();
    }, []);

    if (loading) {
        return <div className="profile-simple">Loading...</div>;
    }

    if (error) {
        return <div className="profile-simple profile-simple--error">{error}</div>;
    }

    return (
        <div className="profile-simple">
            <h1 className="profile-simple__title">Welcome, {userName}!</h1>
        </div>
    );
};

export default Profile;