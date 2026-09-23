import { exec } from 'child_process';
import * as path from 'path';

export function runJobIngestionCLI() {
    console.log('🔄 Triggering France Travail data ingestion CLI...');

    const cliScriptPath = path.resolve(__dirname, '../../../DATA-INGESTION-CLI/src/cli.ts');

    const command = `npx --yes tsx "${cliScriptPath}" fetch-jobs`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ CLI Execution Failed: ${error.message}`);
            return;
        }

        if (stderr && !stderr.includes('Debugger attached')) {
            console.warn(`⚠️ CLI Warning/Error output: ${stderr}`);
        }

        console.log(`✅ CLI Output:\n${stdout}`);
    });
}