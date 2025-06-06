# Frontend Projekt Wirtschaftsinformatik 
# ERP-System für Landwirtschaftliche Konzerne

# Installation und Ausführung
## Installation
1. Node.js und npm müssen installiert sein. 
   - [Node.js herunterladen](https://nodejs.org/)
   - npm wird automatisch mit Node.js installiert.
   - Überprüfung der Installation:
     ```bash
     node -v
     npm -v
     ```
2. Klonen des Repositorys
4. Installieren der Abhängigkeiten:
   ```bash
    npm install
    ```
   
## Ausführung
5. Starten des Entwicklungsservers:
   ```bash
   npm run dev
   ``` 
6. Öffnen des Browsers und Navigieren zu `http://localhost:3000` 
7. Der Entwicklungsserver sollte nun laufen und die Anwendung im Browser anzeigen.

## Fehlerbehandlung
Ein häufiger Fehler, der auftreten kann, ist, dass der Port 5173 bereits von 
einem anderen Prozess belegt ist. 
In diesem Fall kann der Port in der `vite.config.js` Datei geändert werden.
Alternativ kann der Prozess, der den Port belegt, beendet werden.
Dazu kann der Befehl (Windows) `netstat -aon | findstr :3000` verwendet werden, um den Prozess zu finden,
und anschließend mit `kill <PID>` beendet werden, wobei `<PID>` die Prozess-ID ist.

   
   
Installierte Abhängigkeiten:
- [react](https://reactjs.org/)
- [react-dom](https://reactjs.org/)
- [vite](https://vitejs.dev/)
- [mui](https://mui.com/)

## Ordnerstruktur
# src
  - constants: Statische Konstanten und Konfigurationen
  - global-components: Enthält wiederverwendbare Komponenten
    - /common: generische UI-Komponenten (Buttons, Inputs, etc.)
    - /charts: generische Diagramm-Komponenten
    - /layout: generische Layout-Komponenten (Header, Footer, etc.)
  - layouts: Seitenlayouts, die die Struktur der Seiten definieren
  - modules: ERP-spezifische Module für die Gruppen
    - ../components: Dashboard-Komponente
    - ../pages: Produktverwaltungskomponente
    - ../services: Bestellverwaltungskomponente
    - ../index.js: Kundenverwaltungskomponente
  - router: Bindung der Modulrouten an die Anwendung
  - styles: Globale Stile und Theme-Konfigurationen
  - utils: Globale Services und Hilfsfunktionen
    - /api.js: Einstiegspunkt für API-Anfragen
  - App.css: Globale CSS-Stile
  - App.jsx: Hauptkomponente der Anwendung
  - index.css: Globale CSS-Datei
  - Main.jsx: Einstiegspunkt der Anwendung