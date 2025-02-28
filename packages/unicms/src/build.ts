import services from "@/lib/ioc/provider";
import Logger from "@/lib/util/logger";
import path from "path";
import fs from 'fs/promises';
import { cwd } from "process";


export default async function build() {
    try {
        Logger.section("🔨 Creating optimized production build...")
        console.log('\n');

        const dir = services.get<string>('dirname')!;
        const srcDir = path.join(dir, '.unicms');
        const destDir = path.join(cwd(), '.unicms')

        fs.cp(srcDir, destDir, { recursive: true });
    }
    catch (error) {

    }
}

function printError(message: string) {
    console.error(message);
    Logger.error("❌ Production build failed to complete.")
    console.log();
}
