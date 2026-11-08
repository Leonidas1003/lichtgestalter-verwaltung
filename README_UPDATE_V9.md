# Lichtgestalter v9 – Änderungen

- Kopfzeile auf Cloud-Verwaltung geändert.
- PDF-Download als echte PDF-Datei statt Browser-Druckdialog (html2pdf.js via CDN).
- Leistungszeitraum / Lieferdatum aus serviceDate oder älteren Feldnamen auf dem PDF.
- Logo aus logo.png im PDF mit Ladeprüfung.
- Löschaktionen in Dokumentliste und Editor; bei Referenzen zeigt die App die abhängigen Belege.

**Wichtig:** Löschung referenzierter Belege ist gesperrt; ausgestellte Rechnungen dürfen nicht endgültig gelöscht werden. Datenmodell ist weiterhin ein gemeinsames JSON-Workspace-Objekt, daher noch keine sichere parallele Bearbeitung. Browser- und PDF-Rendering muss nach dem Upload live getestet werden.

GitHub: Alle Dateien im Hauptverzeichnis hochladen, insbesondere index.html, pdf-download.js, logo.png, upgrade.js, cloud.js und config.js. Bestehende config.js mit gültigem Publishable Key beibehalten.
