import logging
import asyncio
from datetime import datetime
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers.event import async_track_time_change

DOMAIN = "centralino"
_LOGGER = logging.getLogger(__name__)

async def async_setup(hass: HomeAssistant, config: dict):
    """Configurazione del componente Centralino."""
    conf = config.get(DOMAIN)
    if conf is None:
        _LOGGER.error("Configurazione 'centralino:' non trovata nel configuration.yaml")
        return False

    centralino_config = conf
    hass.data[DOMAIN] = conf
    
    async def async_handle_notify(call: ServiceCall):
        # --- Parametri dall'interfaccia ---
        raw_message = call.data.get("message", "")
        title = call.data.get("title", "")
        target_input = call.data.get("target") 
        urgent = call.data.get("urgent", False)
        with_greeting = call.data.get("with_greeting", False)
        media_type = call.data.get("media_type", "none")
        selected_cameras = call.data.get("cameras", [])
        
        # Nuovi parametri volume dall'interfaccia
        override_vol = call.data.get("volume_level")
        override_urgent_vol = call.data.get("volume_urgent")
        
        if isinstance(target_input, str):
            targets = [t.strip() for t in target_input.split(',')]
        elif isinstance(target_input, list):
            targets = target_input
        else: return

        # Calcolo fascia oraria per saluto e volumi di fallback
        now_h = datetime.now().hour
        time_defs = centralino_config.get('timeDefinitions', {})
        m_start = int(time_defs.get('morningStart', '06:00').split(':')[0])
        a_start = int(time_defs.get('afternoonStart', '12:00').split(':')[0])
        n_start = int(time_defs.get('nightStart', '20:00').split(':')[0])

        if m_start <= now_h < a_start: period = 'morning'
        elif a_start <= now_h < n_start: period = 'afternoon'
        else: period = 'night'

        greeting_text = ""
        if with_greeting:
            if period == 'morning': greeting_text = "Buongiorno."
            elif period == 'afternoon': greeting_text = "Buon pomeriggio."
            else: greeting_text = "Buonasera."

        msg_tts = f"{title + '. ' if title else ''}{greeting_text} {raw_message}".strip()
        
        # --- LOGICA MESSAGGIO TELEGRAM ---
        msg_tg_parts = [f"<b>{title}</b>"] if title else []
        if greeting_text: msg_tg_parts.append(greeting_text)
        msg_tg_parts.append(raw_message)
        msg_tg_parts.append(f"<i>({datetime.now().strftime('%H:%M:%S')})</i>")
        final_tg_message = "\n".join(msg_tg_parts)

        devices_list = centralino_config.get('devices', [])
        
        for t_name in targets:
            device = next((d for d in devices_list if d.get('name') == t_name or d.get('entityId') == t_name), None)
            if not device or not device.get('enabled', True): continue

            # --- SEZIONE TELEGRAM ---
            if device.get('type') == 'telegram':
                chat_id = device.get('chatId')
                target_id = chat_id if chat_id and str(chat_id).strip() else None
                content_sent = False
                if target_id and selected_cameras and media_type != "none":
                    for idx, cam in enumerate(selected_cameras):
                        try:
                            caption = final_tg_message if idx == 0 else f"Camera: {cam}"
                            if media_type == "snapshot":
                                path = f"/config/www/centralino_snap_{idx}.jpg"
                                await hass.services.async_call("camera", "snapshot", {"entity_id": cam, "filename": path})
                                await asyncio.sleep(1.5)
                                await hass.services.async_call("telegram_bot", "send_photo", {"target": [target_id], "file": path, "caption": caption, "parse_mode": "html"})
                                content_sent = True
                            elif media_type == "video":
                                path = f"/config/www/centralino_video_{idx}.mp4"
                                await hass.services.async_call("camera", "record", {"entity_id": cam, "filename": path, "duration": 5})
                                await asyncio.sleep(7)
                                await hass.services.async_call("telegram_bot", "send_video", {"target": [target_id], "file": path, "caption": caption, "parse_mode": "html"})
                                content_sent = True
                        except Exception as e: _LOGGER.error(f"Errore media: {e}")
                if not content_sent and target_id:
                    await hass.services.async_call("telegram_bot", "send_message", {"target": [target_id], "message": final_tg_message, "parse_mode": "html"})
                continue

            # --- SEZIONE AUDIO ---
            entity_id = device.get('entityId')
            if not entity_id: continue
            
            # Controllo DND
            dnd_config = centralino_config.get('dnd', {})
            if dnd_config.get('enabled') and not urgent:
                now = datetime.now().time()
                try:
                    start = datetime.strptime(dnd_config.get('startTime'), "%H:%M").time()
                    end = datetime.strptime(dnd_config.get('endTime'), "%H:%M").time()
                    if (start < end and start <= now <= end) or (start > end and (now >= start or now <= end)): continue
                except: pass

            try:
                # DETERMINAZIONE VOLUME (Interfaccia > YAML)
                if urgent:
                    target_vol = (override_urgent_vol if override_urgent_vol is not None else 80) / 100.0
                else:
                    # Se l'utente ha mosso lo slider usa quello, altrimenti guarda lo YAML
                    if override_vol is not None:
                        target_vol = override_vol / 100.0
                    else:
                        vol_map = device.get('volumes', {})
                        target_vol = float(vol_map.get(period, 40)) / 100.0

                # Snapshot per restore musica
                was_playing = False
                if centralino_config.get('restoreMusic', False):
                    st = hass.states.get(entity_id)
                    if st and st.state == 'playing':
                        was_playing = True
                        await hass.services.async_call("scene", "create", {"scene_id": f"snap_{device.get('id', 'temp')}", "snapshot_entities": [entity_id]})

                await hass.services.async_call("media_player", "volume_set", {"entity_id": entity_id, "volume_level": target_vol})
                await asyncio.sleep(0.5)

                if device.get('type') == 'alexa' and hass.services.has_service("notify", "alexa_media"):
                    await hass.services.async_call("notify", "alexa_media", {"target": [entity_id], "message": msg_tts, "data": {"type": "tts"}})
                else:
                    srv = "google_translate_say" if hass.services.has_service("tts", "google_translate_say") else "speak"
                    await hass.services.async_call("tts", srv, {"entity_id": entity_id, "media_player_entity_id": entity_id, "message": msg_tts, "language": "it"})

                if was_playing:
                    await asyncio.sleep((len(msg_tts) * 0.12) + 3.0)
                    await hass.services.async_call("scene", "turn_on", {"entity_id": f"scene.snap_{device.get('id', 'temp')}"})

            except Exception as e: _LOGGER.error(f"Errore audio su {t_name}: {e}")

    hass.services.async_register(DOMAIN, "notify", async_handle_notify)

    async def shutdown_all(now):
        for d in centralino_config.get('devices', []):
            if d.get('type') != 'telegram' and d.get('entityId'):
                await hass.services.async_call("media_player", "turn_off", {"entity_id": d['entityId']})
    try:
        s_time = datetime.strptime(centralino_config.get('shutdownTime', '01:00'), "%H:%M").time()
        async_track_time_change(hass, shutdown_all, hour=s_time.hour, minute=s_time.minute, second=0)
    except: pass
    return True

