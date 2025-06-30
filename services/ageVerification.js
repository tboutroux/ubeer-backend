const axios = require('axios');

const verifyAgeWithIdAnalyzer = async (documentBase64) => {
    const options = {
        method: 'POST',
        url: 'https://api2-eu.idanalyzer.com/quickscan',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'X-API-KEY': process.env.IDANALYZER_API_KEY // Stocker la clé API dans un fichier .env
        },
        data: { document: documentBase64 }
    };

    try {
        const response = await axios.request(options);
        const ageData = response.data?.data?.age?.[0]?.value || null; // Récupérer l'âge
        return { age: ageData, rawResponse: response.data };
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API IdAnalyzer:', error.message);
        throw new Error('Impossible de vérifier l\'âge.');
    }
};

module.exports = { verifyAgeWithIdAnalyzer };