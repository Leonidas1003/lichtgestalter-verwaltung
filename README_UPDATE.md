# Lichtgestalter Cloud – Update v8 (Testversion)

## Änderungen
- Löschen von Angeboten, AB, Lieferscheinen, Gutschriften mit Warnung und Bestätigung.
- Rechnungen: nur Entwürfe und nur wenn keine spätere Rechnungsnummer existiert; referenzierte Belege bleiben geschützt. Nummernkreise werden nicht zurückgesetzt.
- Leistungszeitraum / Lieferdatum wird mit Beschriftung auf dem PDF angezeigt.
- Logo wird aus `logo.png` im GitHub-Hauptordner geladen und vor dem Druck auf vollständiges Laden geprüft.
- Mehrere bestätigte Firmenkonten können sich bereits anmelden; die vorhandene RLS-Funktion `is_company_admin()` erlaubt bestätigte @dielichtgestalter.de Konten.

## Wichtige Einschränkungen
- **Nicht produktionsreif für parallele Bearbeitung**: `cloud.js` speichert weiterhin den kompletten Workspace als JSON; gleichzeitiges Bearbeiten kann Änderungen überschreiben.
- Die Löschprüfung läuft derzeit im Browser, nicht transaktional in der Datenbank. Für revisionssichere Belegverwaltung und gleichzeitige Rechnungsnummernvergabe ist ein serverseitiges Datenmodell erforderlich.
- Für steuerrechtlich relevante Rechnungen sind Storno und Aufbewahrung notwendig; endgültiges Löschen ist deshalb für ausgestellte Rechnungen blockiert.
- Vor Nutzung mit echten Daten RLS, Backups und Rollen serverseitig prüfen.

## Installation
1. Vorher ein Backup über die App exportieren.
2. ZIP entpacken und alle Dateien in den Root des GitHub-Pages-Repositories hochladen; vorhandene Dateien ersetzen.
3. `config.js` mit der bestehenden funktionierenden Version beibehalten.
4. Nach dem Deployment im privaten Fenster testen.
