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
- [apexcharts](https://apexcharts.com/)

## Ordnerstruktur
# src
- assets: Statische Ressourcen (Bilder, Icons, etc.)
- constants: Statische Konstanten und Konfigurationen
- contexts: React Context Provider (globaler State)
    - /AuthContext.jsx: Authentifizierung Context für App-weites Login-Management
- global-components: Wiederverwendbare UI-Komponenten
    - /common: Generische UI-Komponenten (Buttons, Inputs, etc.)
    - /charts: Generische Diagramm-Komponenten
    - /layout: Layout-Komponenten (Header, Footer, Sidebars)
        - /Header.jsx: Navigationsleiste mit rollenbasierter Menüanzeige
- layouts: Seitenlayouts für strukturelle Organisation
    - /MainLayout.jsx: Hauptlayout mit Header, Sidebars und Footer
- modules: ERP-spezifische Geschäftsmodule
    - /components: Modul-spezifische Komponenten
    - /pages: Seiten für verschiedene ERP-Bereiche
    - /services: Modul-spezifische Business Logic
- pages: Hauptseiten der Anwendung
    - /Dashboard.jsx: Zentrale Übersichtsseite
    - /LoginPage.jsx: Anmeldeseite mit Authentifizierung
- router: Routing-Konfiguration und Navigation
    - /AppRoute.jsx: Hauptrouting mit AuthProvider Integration
    - /ProtectedRoute.jsx: Zugriffskontrolle für geschützte Bereiche
- styles: Globale Stile und Theme-Konfigurationen
- utils: Hilfsfunktionen und Services
    - /api.js: HTTP-Client für Backend-Kommunikation
    - /authService.js: Authentifizierungs-Business Logic
    - /package.json: Utils-spezifische Abhängigkeiten
- App.css: Komponenten-spezifische Stile
- App.jsx: Hauptkomponente der Anwendung
- index.css: Globale Basis-Stile
- main.jsx: Anwendungs-Einstiegspunkt (Vite)