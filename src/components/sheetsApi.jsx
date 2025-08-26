// src/components/SheetsApi.jsx
import React, { useEffect, useState, useRef } from 'react';

const SheetsApi = () => {
  const [content, setContent] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const authorizeButtonRef = useRef(null);
  const signoutButtonRef = useRef(null);
  const contentRef = useRef(null);

  // Configuración de credenciales (reemplaza con tus valores reales)
  const CLIENT_ID = '505380820657-6c4ko4taif3ja72ljju5lsuoc5lhhm8m.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyBsNExnnKZu_eOfrnJW5SppGML-oSBVf8E';
  const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
  const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';
  const SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';

  const [tokenClient, setTokenClient] = useState(null);

  useEffect(() => {
    const initializeGapiClient = async () => {
      try {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        console.log('GAPI initialized');
      } catch (error) {
        console.error('Error initializing GAPI:', error);
      }
    };

    const initializeGisClient = () => {
      if (window.google) {
        const newTokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (resp) => {
            if (resp.error !== undefined) {
              console.error('Auth error:', resp);
              return;
            }
            setIsAuthorized(true);
            signoutButtonRef.current.style.display = 'inline';
            authorizeButtonRef.current.innerText = 'Refresh';
            listMajors();
          },
        });
        setTokenClient(newTokenClient);
        console.log('GIS initialized, tokenClient set');
        setIsLoaded(true);
      }
    };

    const loadLibraries = () => {
      if (!window.gapi) {
        console.error('GAPI not available');
        return;
      }
      window.gapi.load('client', async () => {
        await initializeGapiClient();
        initializeGisClient();
      });
    };

    // Verifica si las bibliotecas están disponibles
    if (window.gapi && window.google) {
      loadLibraries();
    } else {
      const checkInterval = setInterval(() => {
        if (window.gapi && window.google) {
          clearInterval(checkInterval);
          loadLibraries();
        }
      }, 100); // Verifica cada 100ms

      return () => clearInterval(checkInterval);
    }
  }, []);

  const handleAuthClick = () => {
    if (!tokenClient) {
      console.error('Token client not initialized');
      return;
    }

    tokenClient.requestAccessToken({
      prompt: window.gapi.client.getToken() ? '' : 'consent',
    });
  };

  const handleSignoutClick = () => {
    const token = window.gapi.client.getToken();
    if (token) {
      window.google.accounts.oauth2.revoke(token.access_token, () => {
        window.gapi.client.setToken('');
        setContent('');
        setIsAuthorized(false);
        authorizeButtonRef.current.innerText = 'Authorize';
        signoutButtonRef.current.style.display = 'none';
      });
    }
  };

  const listMajors = async () => {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Class Data!A2:E',
      });
      const range = response.result;
      if (!range || !range.values || range.values.length === 0) {
        setContent('No values found.');
        return;
      }
      const output = range.values.reduce(
        (str, row) => `${str}${row[0]}, ${row[4]}\n`,
        'Name, Major:\n'
      );
      setContent(output);
    } catch (err) {
      setContent(`Error: ${err.message}`);
      console.error('Error fetching data:', err);
    }
  };

  // Verifica el estado de autenticación al cargar
  useEffect(() => {
    if (window.gapi && window.gapi.client.getToken()) {
      setIsAuthorized(true);
      signoutButtonRef.current.style.display = 'inline';
      authorizeButtonRef.current.innerText = 'Refresh';
      listMajors();
    }
  }, [isLoaded]);

  return (
    <div className="sheets-api">
      <h1>Sheets API Quickstart</h1>
      <button
        ref={authorizeButtonRef}
        onClick={handleAuthClick}
        disabled={!isLoaded || !tokenClient}
      >
        Authorize
      </button>
      <button ref={signoutButtonRef} onClick={handleSignoutClick} style={{ display: 'none' }}>
        Sign Out
      </button>
      <pre ref={contentRef} style={{ whiteSpace: 'pre-wrap' }}>
        {content}
      </pre>
    </div>
  );
};

export default SheetsApi;