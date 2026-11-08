# Die Lichtgestalter – GitHub Pages + Supabase (Cloud-Testversion)

## Einrichten
1. In Supabase **Authentication → Providers → Email** öffentliche Registrierung ausschalten und E-Mail-Bestätigung aktivieren. Benutzer nur per Einladung über **Authentication → Users** anlegen. Firmen-Domain bei Einladungen manuell kontrollieren.
2. Im Supabase SQL Editor den Inhalt von `supabase.sql` ausführen. Die SQL-Datei erstellt eine **separate `workspace`-Tabelle**; das vorherige Kunden-/Projekt-SQL allein reicht nicht aus.
3. In Supabase unter Project Settings/API die **Project URL** und den **Publishable/anon key** kopieren. In `config.js` eintragen. Niemals Secret-/service_role-Schlüssel eintragen.
4. Dateien aus diesem Ordner (nicht die ZIP-Datei) ins GitHub-Repository hochladen. In Settings → Pages → Deploy from a branch → main / root auswählen.
5. Die GitHub-Pages-URL in Supabase Authentication → URL Configuration als Site URL und Redirect URL hinterlegen.
6. Eingeladenen Benutzer aktivieren, auf der Pages-URL anmelden und zunächst mit **Testdaten** arbeiten.

## Wichtige Grenzen
- Dies ist eine **Cloud-Testversion**, keine produktionsreife Rechnungssoftware.
- Die Speicherung erfolgt in **einer gemeinsamen JSON-Zeile** (`workspace`): parallele Änderungen können sich überschreiben. Nummern werden noch nicht transaktionssicher vergeben.
- Kunden/Projekte/Dokumente werden nicht in die separaten Tabellen `customers` und `projects` geschrieben; die vollständige Migration ist noch ausstehend.
- Rechnungsarchivierung, unveränderliche Belege, A-conto-Verrechnung, Steuerfälle und Drucklayout vor produktiver Nutzung gesondert testen und absichern.
- `config.js` ist leer: ohne Eintragung läuft die App als **lokale Demo**, nicht in der Cloud.
- GitHub Pages ist öffentlich erreichbar; **Datenzugriff** wird durch Supabase Auth + RLS geschützt.
- Keine echten personenbezogenen Kundendaten einsetzen, bevor Zugriffsrechte, Datenschutz und Backups geprüft sind.
