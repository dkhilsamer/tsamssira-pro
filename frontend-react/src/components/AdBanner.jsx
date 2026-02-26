import React, { useEffect } from 'react';

const AdBanner = ({ slot, format = 'auto', responsive = 'true' }) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <div className="ad-container my-8 text-center" style={{ minHeight: '100px', overflow: 'hidden' }}>
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-0000000000000000"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive}></ins>
        </div>
    );
};

export default AdBanner;
