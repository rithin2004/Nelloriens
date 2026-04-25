import { useSelector } from 'react-redux';
import { translations } from '../utils/translations';

const useTranslation = () => {
    const language = useSelector((state) => state.app.language) || 'English';

    const t = (key) => {
        const langData = translations[language] || translations['English'];
        return langData[key] || key; // Fallback to key if translation missing
    };

    return { t, language };
};

export default useTranslation;
