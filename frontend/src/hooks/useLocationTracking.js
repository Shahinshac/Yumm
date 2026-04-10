import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useLocationTracking = (userId, userToken, activeOrderId = null) => {
    const [socket, setSocket] = useState(null);
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        if (!userId || !userToken) return;

        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('🔌 Connected to Location Relay');
            newSocket.emit('join_delivery_room', { delivery_partner_id: userId });
        });

        // Watch Location
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });

                // Emit location update to server
                newSocket.emit('update_location', {
                    token: userToken,
                    lat: latitude,
                    lng: longitude,
                    order_id: activeOrderId
                });
            },
            (error) => {
                console.error("❌ Geolocation error:", error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
            newSocket.disconnect();
        };
    }, [userId, userToken, activeOrderId]);

    return { coords, socket };
};

export default useLocationTracking;
