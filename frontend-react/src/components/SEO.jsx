import React, { useEffect } from 'react';

const SEO = ({ title, description, keywords, image, url }) => {
    const siteName = "Tsamssira Pro";
    const defaultTitle = "Tsamssira Pro | Immobilier de Luxe en Tunisie - Vente & Location";
    const defaultDesc = "Découvrez l'immobilier de luxe en Tunisie : Villas, Appartements haut standing à Tunis, Hammamet, Sousse. عقارات تونس: بيع و كراء شقق و فيلات فاخرة.";
    const defaultKeywords = "immobilier tunisie, agence immobilière, luxe, vente, location, appartement tunis, villa hammamet, S+1, S+2, S+3, haut standing, Gammarth, La Marsa, Lac, Ennasr, Sousse, Djerba, villa avec piscine, عقارات تونس, بيع عقارات, شراء منزل, كراء شقق, فيلا للبيع, وكالة عقارية, تسامسيرة برو";
    const defaultImage = "https://www.tsamssirapro.online/og-image.jpg";
    const defaultUrl = "https://www.tsamssirapro.online/";

    useEffect(() => {
        // Update Title
        document.title = title ? `${title} | ${siteName}` : defaultTitle;

        // Update Meta Description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', description || defaultDesc);
        } else {
            metaDescription = document.createElement('meta');
            metaDescription.name = "description";
            metaDescription.content = description || defaultDesc;
            document.head.appendChild(metaDescription);
        }

        // Update Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.setAttribute('content', keywords || defaultKeywords);
        } else {
            metaKeywords = document.createElement('meta');
            metaKeywords.name = "keywords";
            metaKeywords.content = keywords || defaultKeywords;
            document.head.appendChild(metaKeywords);
        }

        // Update Open Graph tags
        const updateOgTag = (property, content) => {
            let tag = document.querySelector(`meta[property="${property}"]`);
            if (tag) {
                tag.setAttribute('content', content);
            } else {
                tag = document.createElement('meta');
                tag.setAttribute('property', property);
                tag.setAttribute('content', content);
                document.head.appendChild(tag);
            }
        };

        updateOgTag('og:title', title || defaultTitle);
        updateOgTag('og:description', description || defaultDesc);
        updateOgTag('og:image', image || defaultImage);
        updateOgTag('og:url', window.location.href || defaultUrl);

    }, [title, description, keywords, image, url]);

    return null; // Component doesn't render anything to the DOM
};

export default SEO;
