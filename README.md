# 🎛️ Centralino Home Assistant Manager#

**Versione:** 6.0.0 (Camera Support & Smart Volume)  
**Autore:** @ago1980  
**Licenza:** MIT

Un pannello di controllo web professionale per gestire le notifiche di Home Assistant con Intelligenza Artificiale (Google Gemini).


---

## 🚀 Caratteristiche Principali

*   **🤖 AI Generativa:** Scrive automaticamente il codice Python per Home Assistant (Custom Component).
*   **🔉 Smart Volume:** Regola il volume degli speaker in base all'ora (Mattina/Pomeriggio/Sera).
*   **📸 Camera Snapshots:** Invia foto delle telecamere su Telegram e TV quando suona il campanello.
*   **🤫 Do Not Disturb:** Blocca gli annunci audio di notte (ma lascia passare le urgenze).
*   **🐛 Google Home Fix:** Risolve il problema dei Google Home che non parlano dopo un periodo di inattività.

---

## ⚡ Guida Rapida per PROXMOX (Copia & Incolla)

Questa procedura installa il Centralino in **meno di 2 minuti** su un container Proxmox.

### 1. Crea il Container
*   Crea un CT Ubuntu o Debian su Proxmox.
*   Risorse minime: 1 Core, 512MB RAM.
*   Copia l'indirizzo IP (es. `192.168.1.50`).

### 2. Esegui l'installazione
Apri la **Console** del container, copia e incolla questo blocco di comandi:

```bash
# 1. Installa i requisiti base
apt update && apt install -y git curl

# 2. Scarica il progetto 
git clone https://github.com/ago19800/centralino.git
cd centralino

# 3. Avvia il setup automatico
chmod +x setup.sh
./setup.sh
```

> ⚠️ **Nota:** Durante il setup ti verrà chiesta la tua **Google Gemini API Key**.
> È gratis: [Ottieni API Key qui](https://aistudio.google.com/app/apikey).

### 3. Avvia il Centralino
Ogni volta che vuoi avviare il pannello:

```bash
./start.sh
```

Apri il browser su: `http://192.168.1.XX:5173`

---

## 🔧 Come Configurare Home Assistant

1.  Apri il Centralino dal browser.
2.  Configura i tuoi dispositivi (Alexa, Google, Telegram).
3.  Clicca su **"GENERA COMPONENTE"**.
4.  Copia i file generati nella cartella `/config/custom_components/centralino/` del tuo Home Assistant.
5.  Riavvia Home Assistant.

### Esempio Automazione (YAML)

```yaml
alias: "Suona Campanello"
trigger:
  - platform: state
    entity_id: binary_sensor.campanello
    to: "on"
action:
  - service: notify.centralino
    data:
      message: "C'è qualcuno al cancello!"
      target: ["media_player.sala", "media_player.cucina"]
      data:
        urgent: true
        cameras: ["camera.esterna"] # Manda foto su Telegram e TV
```

---

## 🛠️ Aggiornamenti

Per scaricare l'ultima versione:

```bash
cd centralino-ha-manager
git pull
npm install
./start.sh
```
