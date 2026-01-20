#!/bin/bash
# Forza la directory del progetto
cd "$(dirname "$0")"
echo "========================================"
echo "🚀 AVVIO CENTRALINO HA MANAGER"
echo "========================================"

# Verifica se node_modules esiste
if [ ! -d "node_modules" ]; then
    echo "📦 Installazione dipendenze mancanti..."
    npm install
fi

echo "🌐 Pannello disponibile su: http://$(hostname -I | awk '{print $1}'):5173"
echo "----------------------------------------"

# Avvia vite forzando l'host per l'accessibilità esterna
npx vite --host 0.0.0.0