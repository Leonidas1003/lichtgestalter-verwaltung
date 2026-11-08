# Cloud-Login Fix

1. `config.js` mit **Project URL** und **Publishable Key** ausfüllen. Keine Secret Keys verwenden.
2. Alle Dateien dieses Ordners in das Root-Verzeichnis des GitHub-Repositories hochladen und vorhandene Dateien ersetzen.
3. Supabase SQL (`supabase.sql`) nur nach Prüfung bestehender Tabellen/Policies ausführen.
4. In Supabase Authentication öffentliche Registrierung deaktivieren, Benutzer ausschließlich einladen.
5. Login in einem privaten Browserfenster testen.

Wichtig: Dies ist ein Testprototyp mit einer gemeinsamen JSON-Workspace-Tabelle. Keine produktiven Rechnungsdaten verwenden. Die Datenbank muss mit RLS geschützt sein; das UI allein ist keine Sicherheitsgrenze. Gleichzeitiges Bearbeiten kann Daten überschreiben.
