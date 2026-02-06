
"use client";

import React, { useState, useEffect } from 'react';
import { Feather } from 'lucide-react';

const GlobalAngelicBackground = () => {
    const [feathers, setFeathers] = useState<any[]>([]);
    const featherCount = 15;

    useEffect(() => {
        // This code runs only on the client, after the component has mounted.
        // This avoids server/client mismatch errors (hydration errors) from Math.random().
        const newFeathers = Array.from({ length: featherCount }).map((_, i) => ({
            id: i,
            style: {
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${Math.random() * 10 + 10}s`, // Single duration for the combined animation
            }
        }));
        setFeathers(newFeathers);
    }, []); // Empty dependency array means this effect runs only once.

    return (
        <div className="global-angelic-background-container pointer-events-none">
            {feathers.map(feather => (
                <Feather
                    key={feather.id}
                    className="global-feather"
                    style={feather.style}
                />
            ))}
        </div>
    );
};

export default GlobalAngelicBackground;
