#!/bin/bash
set -e

echo "========================================"
echo "   Centralino HA - Auto Installer"
echo "========================================"

# 1. Verifica e Installazione Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non trovato. Installazione v20..."
    # Installa curl se manca
    if ! command -v curl &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y curl
    fi
    # Setup repo NodeSource e installazione
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js installato: $(node -v)"
else
    echo "✅ Node.js già presente: $(node -v)"
fi

# 2. Installazione Dipendenze Progetto
echo "📦 Installazione dipendenze NPM..."
if [ -f "package.json" ]; then
    npm install
else
    echo "❌ Errore: package.json non trovato. Assicurati di essere nella cartella del progetto."
    exit 1
fi

# 3. Configurazione API Key
if [ ! -f .env ]; then
    echo "🔑 Configurazione Chiave API"
    echo "----------------------------------------"
    echo "Inserisci la tua Google Gemini API Key."
    echo "(Puoi ottenerla su: https://aistudio.google.com/app/apikey)"
    read -p "API Key > " USER_KEY
    
    # Scrivi nel file .env
    echo "VITE_API_KEY=$USER_KEY" > .env
    echo "✅ File .env creato con successo."
else
    echo "✅ File .env già presente. Skip configurazione."
fi

# 4. Setup permessi
chmod +x start.sh 2>/dev/null || true

echo "========================================"
echo "🎉 Installazione Completata!"
echo "========================================"
echo "Per avviare il server, esegui:"
echo "  ./start.sh"
echo "========================================"