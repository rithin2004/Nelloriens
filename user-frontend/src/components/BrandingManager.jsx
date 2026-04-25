import { useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * BrandingManager handles dynamic site-wide updates like Favicon and Document Title
 * based on admin settings provided via Redux.
 */
const BrandingManager = () => {
    const { data: footerData } = useSelector((state) => state.footer);
    const adminLogo = footerData?.logo;
    const siteName = footerData?.siteName || 'NELLORIENS';
    const tagline = footerData?.tagline;

    useEffect(() => {
        // 1. Update Document Title
        if (siteName) {
            document.title = siteName + (tagline ? ` | ${tagline.substring(0, 30)}...` : '');
        }

        // 2. Update Favicon Dynamically
        if (adminLogo) {
            const link = document.querySelector("link[rel~='icon']");
            if (link) {
                link.href = adminLogo;
            } else {
                const newLink = document.createElement("link");
                newLink.rel = "icon";
                newLink.href = adminLogo;
                document.head.appendChild(newLink);
            }
        }
    }, [adminLogo, siteName, tagline]);

    return null; // This is a utility component, it renders nothing
};

export default BrandingManager;
