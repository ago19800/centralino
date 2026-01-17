import { GoogleGenAI } from "@google/genai";
import { GlobalConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateHAYaml = async (config: GlobalConfig): Promise<string> => {
  // Bake config to avoid parsing errors
  const pythonConfig = JSON.stringify(config, null, 4);

  // Create the options list for the UI Selector in Home Assistant
  const deviceOptions = config.devices.map(d => `"${d.name}"`).join(", ");
  
  const prompt = `
    You are an expert Home Assistant Developer.
    
    **TASK**: Generate 4 SEPARATE, ROBUST files for the "centralino" custom component.
    
    **CRITICAL REQUEST FROM USER**: 
    1. The README.md MUST be in ITALIAN.
    2. The README.md MUST credit "ago1980" as the author.
    3. Maintain all previous code fixes (Google Beep fix, Music Resume, Language 'it').

    **User Configuration (JSON)**:
    ${pythonConfig}

    **FILES TO GENERATE**:

    ### 1. manifest.json
    {
      "domain": "centralino",
      "name": "Centralino Manager",
      "version": "1.9.5",
      "documentation": "https://github.com/ago1980/centralino",
      "codeowners": ["@ago1980"],
      "requirements": [],
      "iot_class": "local_push"
    }

    ### 2. services.yaml
    notify:
      name: Invia Notifica Centralino
      description: Invia un messaggio audio o testuale ai dispositivi configurati.
      fields:
        title:
          description: Titolo della notifica (opzionale).
          selector:
            text:
        message:
          description: Il messaggio da comunicare.
          required: true
          selector:
            text:
        with_greeting:
          description: Aggiungi saluto automatico (Buongiorno/Buonasera).
          default: false
          selector:
            boolean: {}
        target:
          description: Seleziona dispositivi.
          required: true
          selector:
            select:
              multiple: true
              options: [${deviceOptions}]
        urgent:
          description: Ignora Non Disturbare.
          default: false
          selector:
             boolean: {}

    ### 3. __init__.py
    \`\`\`python
    import logging
    import asyncio
    import json
    import voluptuous as vol
    from datetime import datetime, time
    import homeassistant.helpers.config_validation as cv
    from homeassistant.core import HomeAssistant, ServiceCall
    from homeassistant.helpers.event import async_track_time_change

    DOMAIN = "centralino"
    _LOGGER = logging.getLogger(__name__)
    
    # --- ROBUST CONFIGURATION LOADING ---
    _RAW_CONFIG_JSON = r"""${pythonConfig}"""

    try:
        CENTRALINO_CONFIG = json.loads(_RAW_CONFIG_JSON)
    except Exception as e:
        _LOGGER.error(f"CRITICAL ERROR loading Centralino config: {e}")
        CENTRALINO_CONFIG = {"devices": [], "dnd": {"enabled": False}, "timeDefinitions": {}}

    async def async_setup(hass: HomeAssistant, config: dict):
        hass.data[DOMAIN] = CENTRALINO_CONFIG
        
        async def async_handle_notify(call: ServiceCall):
            raw_message = call.data.get("message", "")
            title = call.data.get("title", "")
            target_input = call.data.get("target") 
            urgent = call.data.get("urgent", False)
            with_greeting = call.data.get("with_greeting", False)
            
            if isinstance(target_input, str):
                targets = [t.strip() for t in target_input.split(',')]
            elif isinstance(target_input, list):
                targets = target_input
            else:
                _LOGGER.warning("Nessun target specificato")
                return

            # --- CALCULATE PERIOD & GREETING ---
            period = 'morning'
            now_h = datetime.now().hour
            try:
                time_defs = CENTRALINO_CONFIG.get('timeDefinitions', {})
                m_start = int(time_defs.get('morningStart', '06:00').split(':')[0])
                a_start = int(time_defs.get('afternoonStart', '12:00').split(':')[0])
                n_start = int(time_defs.get('nightStart', '20:00').split(':')[0])
            except Exception as e:
                _LOGGER.error(f"Errore parsing orari: {e}")
                m_start, a_start, n_start = 6, 12, 20

            if now_h >= m_start and now_h < a_start: period = 'morning'
            elif now_h >= a_start and now_h < n_start: period = 'afternoon'
            else: period = 'night'

            greeting_text = ""
            if with_greeting:
                if period == 'morning': greeting_text = "Buongiorno."
                elif period == 'afternoon': greeting_text = "Buon pomeriggio."
                else: greeting_text = "Buonasera."

            # --- COMPOSE MESSAGES ---
            # TTS Message
            msg_tts_parts = []
            if title: msg_tts_parts.append(title + ".")
            if greeting_text: msg_tts_parts.append(greeting_text)
            msg_tts_parts.append(raw_message)
            final_tts_message = " ".join(msg_tts_parts)

            # Telegram Message
            msg_tg_parts = []
            if title: msg_tg_parts.append(f"<b>{title}</b>")
            if greeting_text: msg_tg_parts.append(greeting_text)
            msg_tg_parts.append(raw_message)
            final_tg_message = "\\n".join(msg_tg_parts)

            _LOGGER.info(f"Centralino notifica a: {targets}")

            devices_list = CENTRALINO_CONFIG.get('devices', [])
            
            for t_name in targets:
                device = next((d for d in devices_list if d.get('name') == t_name or d.get('entityId') == t_name), None)
                
                if not device: continue
                if not device.get('enabled', True): continue

                # --- TELEGRAM ---
                if device.get('type') == 'telegram':
                    chat_id = device.get('chatId')
                    entity_id = device.get('entityId', '')
                    try:
                        if chat_id and str(chat_id).strip() != "":
                            await hass.services.async_call("telegram_bot", "send_message", {
                                "target": [chat_id], 
                                "message": final_tg_message,
                                "parse_mode": "html"
                            })
                        elif "." in entity_id:
                            domain, service = entity_id.split('.', 1)
                            await hass.services.async_call(domain, service, {
                                "message": final_tg_message,
                                "data": {"parse_mode": "html"}
                            })
                    except Exception as e:
                         _LOGGER.error(f"Errore Telegram {t_name}: {e}")
                    continue

                # --- AUDIO DEVICES ---
                entity_id = device.get('entityId')
                if not entity_id: continue
                
                # Check DND
                is_dnd = False
                dnd_config = CENTRALINO_CONFIG.get('dnd', {})
                if dnd_config.get('enabled') and not urgent:
                    now = datetime.now().time()
                    try:
                        start_s = dnd_config.get('startTime', '22:00')
                        end_s = dnd_config.get('endTime', '07:00')
                        start = datetime.strptime(start_s, "%H:%M").time()
                        end = datetime.strptime(end_s, "%H:%M").time()
                        if start < end:
                            if start <= now <= end: is_dnd = True
                        else: 
                            if now >= start or now <= end: is_dnd = True
                    except Exception as e:
                        pass 
                
                if is_dnd: continue

                volumes = device.get('volumes', {})
                target_vol = volumes.get(period, 40)
                if urgent: target_vol = 80 
                target_vol_float = float(target_vol) / 100.0

                try:
                    # 0. Capture Playing State (CRITICAL for Resume)
                    was_playing = False
                    try:
                        st = hass.states.get(entity_id)
                        if st and st.state == 'playing':
                            was_playing = True
                    except:
                        pass

                    # 1. Snapshot
                    if CENTRALINO_CONFIG.get('restoreMusic', False):
                        await hass.services.async_call("scene", "create", {"scene_id": f"snapshot_{device['id']}", "snapshot_entities": [entity_id]})

                    # 2. SMART VOLUME
                    state = hass.states.get(entity_id)
                    current_vol = state.attributes.get('volume_level') if state else None
                    
                    if current_vol is None or abs(current_vol - target_vol_float) > 0.05:
                        await hass.services.async_call("media_player", "volume_set", {"entity_id": entity_id, "volume_level": target_vol_float})
                        wait_time = 4.0 if device.get('type') == 'google' else 0.5
                        await asyncio.sleep(wait_time)
                    else:
                        await asyncio.sleep(0.5)

                    # 3. SPEAK
                    spoken = False
                    dev_type = device.get('type')
                    
                    # ALEXA
                    if dev_type == 'alexa':
                        if hass.services.has_service("notify", "alexa_media"):
                            try:
                                await hass.services.async_call("notify", "alexa_media", {
                                    "target": [entity_id], "message": final_tts_message, "data": {"type": "tts"}
                                })
                                spoken = True
                            except: spoken = False
                    
                    # GOOGLE (Priority: google_translate_say + IT)
                    elif dev_type == 'google':
                        if hass.services.has_service("tts", "google_translate_say"):
                            try:
                                await hass.services.async_call("tts", "google_translate_say", {
                                    "entity_id": entity_id, "message": final_tts_message, "language": "it"
                                })
                                spoken = True
                            except: pass
                        if not spoken and hass.services.has_service("tts", "speak"):
                             try:
                                await hass.services.async_call("tts", "speak", {
                                    "media_player_entity_id": entity_id, "message": final_tts_message, "language": "it"
                                })
                                spoken = True
                             except: pass

                    # GENERIC
                    else:
                        if hass.services.has_service("tts", "speak"):
                             try:
                                await hass.services.async_call("tts", "speak", {
                                    "media_player_entity_id": entity_id, "message": final_tts_message, "language": "it"
                                })
                                spoken = True
                             except: pass
                        if not spoken and hass.services.has_service("tts", "google_translate_say"):
                            try:
                                await hass.services.async_call("tts", "google_translate_say", {
                                    "entity_id": entity_id, "message": final_tts_message, "language": "it"
                                })
                                spoken = True
                            except: pass
                                
                    if not spoken:
                         _LOGGER.error(f"IMPOSSIBILE PARLARE SU {t_name}")

                    # 4. WAIT FOR SPEECH TO FINISH (Extended for Resume reliability)
                    # We add a significant buffer to ensure the TTS app is fully done and the device is ready to switch apps back.
                    # Base: 0.1s per char + 5s overhead.
                    delay = (len(final_tts_message) * 0.1) + 5.0
                    await asyncio.sleep(delay)

                    # 5. RESTORE
                    if CENTRALINO_CONFIG.get('restoreMusic', False):
                         # Turn on scene to restore app/volume
                         await hass.services.async_call("scene", "turn_on", {"entity_id": f"scene.snapshot_{device['id']}"})
                         
                         # CRITICAL RESUME FIX:
                         # If it was playing, we force a 'play' command. 
                         # The scene restore often leaves YouTube in 'paused' or 'idle' state after app switch.
                         if was_playing:
                             await asyncio.sleep(2.0) # Allow scene to apply
                             try:
                                await hass.services.async_call("media_player", "media_play", {"entity_id": entity_id})
                                _LOGGER.info(f"Forcing RESUME on {t_name}")
                             except:
                                pass

                except Exception as e:
                    _LOGGER.error(f"Errore audio {t_name}: {e}")

        hass.services.async_register(DOMAIN, "notify", async_handle_notify)

        async def shutdown_devices(now):
            for d in CENTRALINO_CONFIG.get('devices', []):
                if d.get('type') != 'telegram':
                    await hass.services.async_call("media_player", "turn_off", {"entity_id": d['entityId']})

        try:
            shutdown_time_str = CENTRALINO_CONFIG.get('shutdownTime', '01:00')
            sd_time = datetime.strptime(shutdown_time_str, "%H:%M").time()
            async_track_time_change(hass, shutdown_devices, hour=sd_time.hour, minute=sd_time.minute, second=0)
        except:
            pass

        return True
    \`\`\`

    ### 4. README.md
    # Centralino Manager
    **Autore:** ago1980

    ## Descrizione
    Componente personalizzato per Home Assistant per gestire notifiche audio e testuali in modo centralizzato.

    ## Funzionalità
    - **Gestione Volume Intelligente:** Cambia il volume in base all'ora (Mattina, Pomeriggio, Notte).
    - **Google Home Fix:** Risolto il problema del "bip" senza voce e forzata lingua Italiana.
    - **Music Resume:** Riprende la musica (es. YouTube) dopo l'annuncio.
    - **Non Disturbare:** Orari silenziosi configurabili.

    ## Installazione
    Copia questi file nella cartella \`custom_components/centralino\`.

    **Output Rules**:
    - Only return the file contents separated by \`### filename\`.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    let text = response.text || "";
    text = text.replace(/^```\w*\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
    return text;
  } catch (error) {
    console.error("Error generating component:", error);
    throw new Error("Failed to generate Custom Component.");
  }
};