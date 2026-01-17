# Centralino Manager per Home Assistant

**Autore e Sviluppo:** @ago1980

## 🇮🇹 Descrizione del Progetto

**Centralino Manager** è uno strumento web avanzato progettato per generare automaticamente un **Custom Component per Home Assistant**. 

Il suo scopo è risolvere i problemi comuni delle notifiche domotiche (volumi sbagliati di notte, voci metalliche, musica che si interrompe) creando un sistema di "Centralino" unificato per tutta la casa.

### 🚀 Cosa fa il componente generato?

Una volta configurato tramite questa interfaccia e installato su Home Assistant, il componente `centralino` offre le seguenti funzionalità esclusive:

1.  **Volumi Intelligenti (Smart Volume)**
    *   Definisci volumi diversi per **Mattina**, **Pomeriggio** e **Notte**.
    *   Il sistema regola il volume *prima* di parlare e lo ripristina dopo, evitando urla di Alexa o Google Home nel cuore della notte.

2.  **Fix Completo per Google Home / Nest**
    *   **Stop ai "Bip"**: Risolve il problema per cui Google Home emette solo un suono senza parlare.
    *   **Lingua Italiana**: Forza l'accento italiano (spesso i TTS generici usano l'inglese per errore).
    *   **Ripresa Musica (Music Resume)**: Se stavi ascoltando musica (Spotify, YouTube Music), il sistema fa l'annuncio e **riprende automaticamente la musica** da dove era rimasta (risolve il bug noto del protocollo Cast).

3.  **Supporto Multi-Piattaforma**
    *   Gestisce contemporaneamente **Alexa**, **Google Home/Cast**, **Sonos** e **Telegram**.
    *   Per Telegram, invia messaggi formattati in HTML (grassetto per i titoli).

4.  **Modalità Non Disturbare (DND)**
    *   Imposta orari di silenzio (es. 22:00 - 07:00).
    *   Supporta notifiche "Urgenti" che bypassano il silenzio in caso di emergenza.

5.  **Saluti Contestuali**
    *   Aggiunge automaticamente "Buongiorno", "Buon pomeriggio" o "Buonasera" prima del messaggio in base all'orario.

## 🛠️ Come si usa

1.  Apri l'interfaccia web di questo progetto.
2.  Inserisci i tuoi dispositivi (nome ed `entity_id` di Home Assistant).
3.  Configura gli orari per le fasce giornaliere (Mattina, Pomeriggio, Sera).
4.  Clicca su **"Generate HACS Component"**.
5.  Copia i file generati nella cartella `/config/custom_components/centralino/` del tuo Home Assistant.
6.  Riavvia Home Assistant.

## 📝 Esempio di utilizzo (Automazione)

```yaml
service: centralino.notify
data:
  target: ["Google Cucina", "Alexa Salotto"]
  title: "Lavatrice"
  message: "Il ciclo di lavaggio è terminato."
  with_greeting: true
  urgent: false
```

---
*Progetto sviluppato e mantenuto da **ago1980**.*
