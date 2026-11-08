# Version 0.7 – Testversion

- Original-Logo aus der bereitgestellten PDF als eingebettetes PNG in der Druckvorlage. Logo funktioniert ohne externe Dateien.
- Quelldokumente werden nur vom aktuell gewählten Kunden angeboten; zusätzliche Prüfung beim Übernehmen und Speichern.
- Rechnungen können auf frühere Rechnungen des gleichen Kunden und Projekts Bezug nehmen. Bei einer Kette werden die bereits angerechneten Vorgänger automatisch aufgelöst, mit eindeutigen IDs gegen Mehrfachabzug. Die Beträge werden als verbleibende Teilrechnungsbeträge angerechnet.
- Einstellungen: Nummernkreis je Kalenderjahr und Typ Q/C/I/D als zuletzt verwendete Nummer. Automatischer neuer Jahreszähler, Nummernformat `I_2026.11.01`.

## Testhinweise
1. Vorher Backup exportieren.
2. `index.html` öffnen; Logo beim Druck eines Dokuments kontrollieren.
3. Kunden A und B anlegen, Angebote für beide erstellen. Bei Rechnung für A darf Angebot von B nicht in der Auswahl stehen.
4. Drei Rechnungen desselben Projekts erstellen und bei der dritten nur die zweite auswählen. Die Abzüge sollten beide vorherigen Netto-/Steuer-Restbeträge berücksichtigen.
5. In Einstellungen für 2026 einen Zähler setzen und neue Dokumente erstellen; anschließend Datum 2027 testen.

## Noch nicht produktionsreif
Die App verwendet weiterhin Browser-localStorage. Bei gleichzeitigem Cloud-Betrieb sind serverseitige Berechtigungen, transaktionssichere Nummernkreise, GoBD-Archivierung und vollständige steuerliche Prüfung zwingend erforderlich. Keine abschließende Buchhaltungs- oder Safari-End-to-End-Prüfung erfolgt.
