import { exec } from 'child_process';
import * as path from 'path';

/**
 * Déclenche le script CLI d'ingestion des offres France Travail en tâche de fond.
 */
export function runJobIngestionCLI() {
    console.log('[JOB-SYNC] Déclenchement du CLI d\'ingestion des offres France Travail...');

    const cliScriptPath = path.resolve(__dirname, '../../../DATA-INGESTION-CLI/src/cli.ts');

    const command = `npx --yes tsx "${cliScriptPath}" fetch-jobs`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`[JOB-SYNC] Échec de l'exécution du CLI : ${error.message}`);
            return;
        }

        if (stderr && !stderr.includes('Debugger attached')) {
            console.warn(`[JOB-SYNC] Avertissement du CLI : ${stderr}`);
        }

        console.log(`[JOB-SYNC] Sortie du CLI :\n${stdout}`);
    });
}