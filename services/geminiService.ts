import { GoogleGenAI } from "@google/genai";
import { GlobalConfig } from "../types";

export const generateHAYaml = async (config: GlobalConfig): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const pythonConfig = JSON.stringify(config, null, 4);
  
  const prompt = `
    Sei un Senior Home Assistant Developer. Genera il codice per un Custom Component HACS chiamato "centralino".
    L'autore del componente è "ago1980". Il README deve essere in ITALIANO.

    **REGOLE DEL COMPONENTE**:
    1. Domain: "centralino".
    2. Servizio: "notify".
    3. Parametri del servizio:
       - target: (lista nomi o entity_id dei dispositivi configurati)
       - message: (testo da annunciare o inviare)
       - title: (titolo opzionale)
       - cameras: (lista entità camera aggiuntive oltre a quelle pre-configurate)
       - urgent: (boolean, bypassa DND e alza volume)
       - with_greeting: (boolean, aggiunge Buongiorno/Buonasera)

    **LOGICA INTERNA (Python)**:
    - **Gestione Volume**: Leggi la configurazione JSON e imposta il volume del media_player target in base all'ora (morning/afternoon/night).
    - **Google Home Fix**: Se il target è Google, usa obbligatoriamente il servizio 'tts.google_translate_say' con language: 'it'.
    - **Gestione Telecamere (MOLTO IMPORTANTE)**:
      - Ogni dispositivo può avere 'cameraEntities' associate nel JSON.
      - Se il dispositivo target ha telecamere (o vengono passate nel servizio), il componente deve:
        1. Attendere 'snapDelay' secondi (se configurato).
        2. Scattare uno snapshot per ogni camera.
        3. Se il target è 'telegram', invia le foto direttamente.
        4. Se il target è un Audio Speaker (Alexa/Google), cerca nel JSON il primo dispositivo di tipo 'telegram' abilitato e invia lì le foto.
    - **Ripristino Musica**: Se 'restoreMusic' è True, salva lo stato con scene.create, annuncia il TTS, attendi la fine (delay dinamico basato su lunghezza testo) e ripristina la scena. Se prima era in 'playing', invia il comando media_play.
    - **DND**: Se abilitato e non è 'urgent', blocca le notifiche audio negli orari definiti.

    **CONFIGURAZIONE JSON DA USARE**:
    ${pythonConfig}

    **FILE DA GENERARE (Usa il marcatore ### nome_file)**:
    - manifest.json
    - services.yaml
    - __init__.py (Codice asincrono completo e pulito)
    - README.md (In Italiano, citando ago1980 e spiegando come configurare il componente in HA)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (error: any) {
    console.error("AI Error:", error);
    throw new Error("Errore Gemini: " + error.message);
  }
};