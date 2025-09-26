import { useState, useEffect } from 'react';

const useChartsData = () => {
  const [data, setData] = useState({
    correos: [],
    reenvios: [],
    habeasCorpus: [],
    loading: true,
    error: null
  });

  // ✅ MOVER fetchData FUERA DEL useEffect PARA QUE SEA ACCESIBLE
  const fetchData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // ✅ USAR URL COMPLETA CON LOCALHOST:5000
      const [correosRes, reenviosRes, habeasRes] = await Promise.all([
        fetch('http://localhost:5000/api/correos'),
        fetch('http://localhost:5000/api/reenvios'),
        fetch('http://localhost:5000/api/habeas-corpus')
      ]);

      // ✅ VERIFICAR RESPUESTAS Y MOSTRAR DETALLES DEL ERROR
      if (!correosRes.ok) {
        const errorText = await correosRes.text();
        console.error('Error en correos:', errorText);
        throw new Error(`Error al obtener correos: ${correosRes.status}`);
      }

      if (!reenviosRes.ok) {
        const errorText = await reenviosRes.text();
        console.error('Error en reenvíos:', errorText);
        throw new Error(`Error al obtener reenvíos: ${reenviosRes.status}`);
      }

      if (!habeasRes.ok) {
        const errorText = await habeasRes.text();
        console.error('Error en habeas corpus:', errorText);
        throw new Error(`Error al obtener habeas corpus: ${habeasRes.status}`);
      }

      const [correos, reenvios, habeasCorpus] = await Promise.all([
        correosRes.json(),
        reenviosRes.json(),
        habeasRes.json()
      ]);

      console.log('✅ Datos obtenidos:', {
        correos: correos.length,
        reenvios: reenvios.length,
        habeasCorpus: habeasCorpus.length
      });

      setData({
        correos: Array.isArray(correos) ? correos : [],
        reenvios: Array.isArray(reenvios) ? reenvios : [],
        habeasCorpus: Array.isArray(habeasCorpus) ? habeasCorpus : [],
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('❌ Error fetching charts data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ FUNCIÓN PARA RECARGAR DATOS MANUALMENTE
  const refetch = () => {
    fetchData();
  };

  return { ...data, refetch };
};

export default useChartsData;