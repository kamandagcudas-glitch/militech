
"use client";

import React from 'react';
import { Feather } from 'lucide-react';

const GlobalAngelicBackground = () => {
    const featherCount = 15;

    return (
        <div className="global-angelic-background-container pointer-events-none">
            {Array.from({ length: featherCount }).map((_, i) => (
                <Feather
                    key={i}
                    className="global-feather"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 15}s`,
                        animationDuration: `${Math.random() * 10 + 8}s, ${Math.random() * 4 + 3}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default GlobalAngelicBackground;
