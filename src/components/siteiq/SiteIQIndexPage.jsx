import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SiteIQIndexPage = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        navigate('/siteiq/chatbots', { replace: true });
    }, [navigate]);

    return null;
};

export default SiteIQIndexPage;
