# 📞 Centralino Manager for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/v/release/ago1980/centralino)](https://github.com/ago1980/centralino/releases)
[![Maintainer](https://img.shields.io/badge/Maintainer-ago1980-blue.svg)](https://github.com/ago1980)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.1.0%2B-blue.svg)](https://www.home-assistant.io/)
[![License](https://img.shields.io/github/license/ago1980/centralino)](LICENSE)

# 📞 Centralino Manager
![Logo](https://raw.githubusercontent.com/TUO_USERNAME/TUO_REPO/main/custom_components/centralino/icon.png)
<div align="center">





## ☕ Supporta il Progetto

**Se questo addon ti è utile, offrimi un caffè!**

[![PayPal](https://img.shields.io/badge/PayPal-Dona%20Ora-00457C?logo=paypal&style=for-the-badge)](https://paypal.me/ago19800)

**[paypal.me/ago19800](https://paypal.me/ago19800)**

*Ogni donazione mi aiuta a continuare a sviluppare e migliorare questo custom!* 🙏

</div>



**Centralino Manager** è un'integrazione custom per Home Assistant che centralizza e rende intelligenti le notifiche della tua smart home. Gestisce automaticamente speaker (Alexa, Google Home) e Telegram, occupandosi di volumi orari, messaggi vocali, foto e video dalle telecamere.

---

## ✨ Funzionalità Principali

### 📢 **Notifiche Multi-Dispositivo**
Invia un messaggio contemporaneamente a tutti i tuoi dispositivi usando nomi semplici:
```yaml
target:
  - soggiorno    # Alexa
  - cucina       # Google Home
  - telegram_io  # Telegram
```

### 📷 **Supporto Media Avanzato su Telegram**
Scegli direttamente dall'interfaccia cosa inviare:
- **Solo Testo**: Messaggio semplice
- **Snapshot (Foto)**: Cattura istantanea dalle telecamere
- **Video (5 secondi)**: Registrazione breve per eventi importanti

### 🕒 **Volumi Intelligenti**
Gestisce automaticamente il volume degli speaker in base all'ora:
- **Mattina** (06:00-12:00): Volume più basso per non disturbare
- **Pomeriggio** (12:00-20:00): Volume normale
- **Sera** (20:00-06:00): Volume ridotto

### 🎚️ **Controllo Volume Manuale**
Slider integrati nel servizio per forzare il volume al momento dell'invio:
```yaml
volume_level: 75  # Forza volume al 75%
```

### 🌙 **Modalità Non Disturbare (DND)**
Silenzia automaticamente le notifiche non urgenti in orari notturni. Le notifiche urgenti bypassano il DND.

### 🎵 **Ripristino Musica**
Se uno speaker sta riproducendo musica:
1. Centralino salva lo stato
2. Abbassa il volume
3. Pronuncia il messaggio
4. Ripristina musica e volume originale

### ⏰ **Shutdown Programmato**
Spegnimento automatico di tutti i media player a un orario prestabilito (es. 01:00).

---

## 🚀 Installazione

### Metodo 1: Tramite HACS (Consigliato)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=ago19800&repository=centralino&category=integration)

**Oppure manualmente:**

1. Assicurati che [HACS](https://hacs.xyz/) sia installato
2. Vai su **HACS** → **Integrazioni**
3. Clicca sui **tre puntini** (⋮) in alto a destra
4. Seleziona **Repository personalizzati**
5. Inserisci:
   - **URL**: `https://github.com/ago19800/centralino`
   - **Categoria**: `Integration`
6. Clicca **Aggiungi**
7. Cerca "**Centralino Manager**" e clicca **Scarica**
8. **Riavvia Home Assistant**

### Metodo 2: Installazione Manuale

1. Scarica l'ultima release da [GitHub Releases](https://github.com/ago19800/centralino/releases)
2. Estrai i file
3. Copia la cartella `centralino` in `/config/custom_components/`
4. La struttura finale deve essere:
   ```
   /config/custom_components/centralino/
   ├── __init__.py
   ├── manifest.json
   ├── services.yaml
   └── hacs.json
   ```
5. **Riavvia Home Assistant**

---

## ⚙️ Configurazione

Aggiungi la configurazione al tuo file `configuration.yaml`:

### Configurazione Base

```yaml
centralino:
  devices:
    # Speaker Alexa
    - id: "1"
      name: "soggiorno"
      entityId: "media_player.alexa_soggiorno"
      type: "alexa"
      volumes:
        morning: 40      # Volume mattina (6-12)
        afternoon: 50    # Volume pomeriggio (12-20)
        night: 20        # Volume sera (20-6)
      enabled: true

    # Speaker Google Home
    - id: "2"
      name: "cucina"
      entityId: "media_player.google_cucina"
      type: "google"
      volumes:
        morning: 30
        afternoon: 45
        night: 15
      enabled: true

    # Notifiche Telegram
    - id: "3"
      name: "telegram_io"
      chatId: "123456789"    # Il tuo Chat ID Telegram
      type: "telegram"
      enabled: true

  # Definizione fasce orarie
  timeDefinitions:
    morningStart: "06:00"     # Inizio mattina
    afternoonStart: "12:00"   # Inizio pomeriggio
    nightStart: "20:00"       # Inizio sera

  # Non Disturbare (DND)
  dnd:
    enabled: true
    startTime: "22:30"        # Inizio silenzio
    endTime: "07:30"          # Fine silenzio

  shutdownTime: "01:00"       # Spegnimento automatico speaker
  restoreMusic: true          # Ripristina musica dopo annunci
```

### Come Trovare il Chat ID Telegram

1. Apri Telegram
2. Cerca il bot `@userinfobot`
3. Invia `/start`
4. Ti risponderà con il tuo Chat ID (es. `123456789`)
5. Copia quel numero nella configurazione

### Configurazione Avanzata con Più Dispositivi

```yaml
centralino:
  devices:
    # Alexa Camera da Letto
    - id: "1"
      name: "camera"
      entityId: "media_player.echo_dot_camera"
      type: "alexa"
      volumes: { morning: 20, afternoon: 40, night: 10 }
      enabled: true

    # Alexa Cucina
    - id: "2"
      name: "alexa_cucina"
      entityId: "media_player.echo_show_cucina"
      type: "alexa"
      volumes: { morning: 50, afternoon: 60, night: 25 }
      enabled: true

    # Google Salotto
    - id: "3"
      name: "salotto"
      entityId: "media_player.nest_hub_salotto"
      type: "google"
      volumes: { morning: 45, afternoon: 60, night: 20 }
      enabled: true

    # Telegram Personale
    - id: "4"
      name: "telegram_famiglia"
      chatId: "123456789"
      type: "telegram"
      enabled: true

    # Telegram Gruppo (nota il chatId negativo)
    - id: "5"
      name: "telegram_gruppo"
      chatId: "-987654321"
      type: "telegram"
      enabled: true

  timeDefinitions:
    morningStart: "07:00"
    afternoonStart: "13:00"
    nightStart: "21:00"

  dnd:
    enabled: true
    startTime: "23:00"
    endTime: "07:00"

  shutdownTime: "02:00"
  restoreMusic: true
```

---

## 🛠️ Utilizzo del Servizio

L'integrazione espone il servizio `centralino.notify`. Puoi usarlo in automazioni, script o chiamarlo manualmente.

### Parametri Disponibili

| Parametro | Tipo | Obbligatorio | Descrizione |
|-----------|------|--------------|-------------|
| `message` | string | ✅ | Il testo del messaggio |
| `target` | string/list | ✅ | Nome dispositivo o lista (es. `soggiorno` o `["soggiorno", "cucina"]`) |
| `title` | string | ❌ | Titolo del messaggio (grassetto su Telegram) |
| `media_type` | select | ❌ | Tipo media: `none`, `snapshot`, `video` (default: `none`) |
| `cameras` | list | ❌ | Lista telecamere per foto/video |
| `volume_level` | number | ❌ | Forza volume speaker 0-100 (ignora configurazione) |
| `volume_urgent` | number | ❌ | Volume per notifiche urgenti (default: 80) |
| `with_greeting` | boolean | ❌ | Aggiunge saluto automatico ("Buongiorno", etc.) |
| `urgent` | boolean | ❌ | Bypassa DND e usa volume alto |

---

## 📝 Esempi Pratici

### Esempio 1: Notifica Semplice

```yaml
service: centralino.notify
data:
  message: "La lavatrice ha finito"
  target: soggiorno
```

### Esempio 2: Notifica Multi-Dispositivo con Saluto

```yaml
service: centralino.notify
data:
  title: "Promemoria"
  message: "Ricordati di stendere i panni"
  with_greeting: true
  target:
    - soggiorno
    - cucina
    - telegram_io
```

**Output TTS**: *"Buongiorno. Promemoria. Ricordati di stendere i panni"*

### Esempio 3: Allarme con Foto su Telegram

```yaml
service: centralino.notify
data:
  title: "ALLARME"
  message: "Movimento rilevato al cancello!"
  media_type: "snapshot"
  cameras:
    - camera.ingresso
    - camera.giardino
  urgent: true
  target:
    - telegram_famiglia
    - soggiorno  # Anche annuncio vocale
```

### Esempio 4: Notifica con Video (5 secondi)

```yaml
service: centralino.notify
data:
  message: "Qualcuno ha suonato al campanello"
  media_type: "video"
  cameras:
    - camera.citofono
  target: telegram_io
```

### Esempio 5: Volume Personalizzato

```yaml
service: centralino.notify
data:
  message: "Attenzione: forno preriscaldato"
  target: cucina
  volume_level: 80  # Forza volume al 80% (ignora configurazione oraria)
```

### Esempio 6: Automazione Completa - Lavatrice Finita

```yaml
automation:
  - alias: "Notifica Lavatrice Completata"
    trigger:
      - platform: state
        entity_id: sensor.lavatrice_stato
        to: "completato"
    action:
      - service: centralino.notify
        data:
          title: "Lavatrice"
          message: "Il ciclo di lavaggio è terminato. Puoi stendere i panni!"
          with_greeting: true
          target:
            - soggiorno
            - telegram_famiglia
```

### Esempio 7: Allarme Notturno (Bypassa DND)

```yaml
automation:
  - alias: "Allarme Movimento Notte"
    trigger:
      - platform: state
        entity_id: binary_sensor.sensore_movimento_giardino
        to: "on"
    condition:
      - condition: time
        after: "23:00:00"
        before: "06:00:00"
    action:
      - service: centralino.notify
        data:
          title: "ALLARME SICUREZZA"
          message: "Rilevato movimento in giardino!"
          media_type: "video"
          cameras:
            - camera.giardino_anteriore
            - camera.giardino_posteriore
          urgent: true  # Ignora DND e usa volume alto
          target:
            - camera
            - telegram_famiglia
```

### Esempio 8: Promemoria Quotidiano

```yaml
automation:
  - alias: "Buongiorno con Meteo"
    trigger:
      - platform: time
        at: "07:00:00"
    condition:
      - condition: state
        entity_id: binary_sensor.workday
        state: "on"
    action:
      - service: centralino.notify
        data:
          message: >
            Il caffè è pronto! Oggi ci sono {{ states('sensor.temperatura_esterna') }} gradi
            e {{ states('weather.casa') }}
          with_greeting: true
          target:
            - camera
            - cucina
```

---

## 📋 Requisiti Tecnici

### Dipendenze Richieste

- **Home Assistant** 2024.1.0 o superiore
- **Telegram Bot** (se usi notifiche Telegram)
  ```yaml
  # configuration.yaml
  telegram_bot:
    - platform: polling
      api_key: "TUO_BOT_TOKEN"
      allowed_chat_ids:
        - 123456789
  ```
- **Alexa Media Player** (se usi dispositivi Alexa)
- **Google TTS** o altro servizio TTS (se usi Google Home)

### Prerequisiti per Media

- La cartella `/config/www/` deve esistere per snapshot e video
- Le telecamere devono supportare `camera.snapshot` e `camera.record`
- Telegram Bot deve essere configurato correttamente

---

## 🔧 Risoluzione Problemi

### Servizio non trovato

**Problema**: `Action centralino.notify not found`

**Soluzione**:
1. Verifica che i file siano in `/config/custom_components/centralino/`
2. Controlla `configuration.yaml` contenga `centralino:`
3. Riavvia Home Assistant
4. Controlla i log: **Impostazioni** → **Sistema** → **Log**

### Telegram non riceve messaggi

**Problema**: Nessun messaggio arriva su Telegram

**Soluzioni**:
1. Verifica Chat ID corretto (usa `@userinfobot`)
2. Verifica `telegram_bot` configurato in `configuration.yaml`
3. Controlla che il bot sia stato avviato (`/start`)
4. Verifica nome dispositivo corretto in `target:`

### Speaker non riproduce audio

**Problema**: Alexa/Google non parla

**Soluzioni**:
1. Verifica `entityId` corretto (usa **Strumenti per sviluppatori** → **Stati**)
2. Per Alexa: verifica integrazione `alexa_media_player` installata
3. Per Google: verifica servizio TTS disponibile
4. Controlla che dispositivo sia `enabled: true`
5. Verifica non sia in orario DND (o usa `urgent: true`)

### DND non funziona

**Problema**: Le notifiche arrivano anche di notte

**Soluzioni**:
1. Verifica `dnd.enabled: true` in `configuration.yaml`
2. Controlla orari corretti (formato `HH:MM`)
3. Le notifiche con `urgent: true` bypassano il DND (comportamento corretto)

### Volume non cambia

**Problema**: Lo speaker è sempre allo stesso volume

**Soluzioni**:
1. Verifica orari fasce in `timeDefinitions`
2. Controlla volumi configurati per ogni fascia nel dispositivo
3. Se usi `volume_level` nel servizio, questo forza il volume

---

## 🐛 Debug e Log

Abilita log dettagliati aggiungendo in `configuration.yaml`:

```yaml
logger:
  default: info
  logs:
    custom_components.centralino: debug
```

Poi controlla: **Impostazioni** → **Sistema** → **Log**

---

## 📚 Documentazione Aggiuntiva

- [Home Assistant Documentation](https://www.home-assistant.io/docs/)
- [Telegram Bot Setup](https://www.home-assistant.io/integrations/telegram_bot/)
- [Alexa Media Player](https://github.com/custom-components/alexa_media_player)

---

## 🤝 Contribuire

Contributi benvenuti! Per segnalare bug o richiedere funzionalità:

1. Apri una [Issue](https://github.com/ago1980/centralino/issues)
2. Descrivi il problema o la feature richiesta
3. Se possibile, includi:
   - Versione Home Assistant
   - Log rilevanti
   - Configurazione (senza dati sensibili)

---

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT - vedi il file [LICENSE](LICENSE) per i dettagli.

---

## ⭐ Supporta il Progetto

Se trovi utile questa integrazione:
- ⭐ Lascia una stella su GitHub
- 🐛 Segnala bug o suggerisci miglioramenti
- 📢 Condividi con la community Home Assistant
- ☕ [Offrimi un caffè](https://paypal.me/ago19800) 

---

## 📞 Supporto

- **Issues**: [GitHub Issues](https://github.com/ago19800/centralino/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ago19800/centralino/discussions)
- **Community**: [Forum Home Assistant Italia](https://forum.hassiohelp.eu/)

---

**Sviluppato da** [@ago1980](https://github.com/ago19800)  
**Versione** 2.4.0
