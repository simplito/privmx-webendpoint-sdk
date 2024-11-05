#!/usr/bin/env node

import { confirm, input } from '@inquirer/prompts';
import { join } from 'node:path';
import { rm } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';

// @ts-ignore
import AdmZip from 'adm-zip';
import ora from 'ora';

type ProjectType = {
    name: string,
    matchFn: (pckgJson: PackageJsonDependencies) => Promise<boolean>,
    setup: (assetsPath: string) => Promise<void>
}

type AssetFetcher = (version: string, saveTo: string) => Promise<string>

async function pressEnterToContinue() {
    await input({
        message: 'Press ENTER to continue'
    });
}


const fetchInternalRepository: AssetFetcher = async (version: string, saveTo: string) => {
    const link = `https://builds.s24.simplito.com/web/main/privmx-webendpoint-${version}.zip`;
    const fileName = link.split('/').pop() || 'wasm-assets.zip';
    const resp = await fetch(link);
    const savedFilePath = join(saveTo, fileName);
    if (resp.ok && resp.body) {
        let writer = createWriteStream(savedFilePath);
        Readable.fromWeb(resp.body as any).pipe(writer);
    }
    while (true) {
        if (existsSync(savedFilePath)) {
            break;
        }
        await new Promise((resolve, reject) => {
            setTimeout(resolve, 100);
        });
    }
    return savedFilePath;
};

const fetchPublicRepository: AssetFetcher = async (version, saveTo) => {
    const versionName = version.startsWith('v') ? version : `v${version}`
    const link = `https://builds.simplito.com/web/main/privmx-webendpoint-${versionName}.zip`;
    const fileName = link.split('/').pop() || 'wasm-assets.zip';
    const resp = await fetch(link);
    const savedFilePath = join(saveTo, fileName);
    if (resp.ok && resp.body) {
        let writer = createWriteStream(savedFilePath);
        Readable.fromWeb(resp.body as any).pipe(writer);
    }
    while (true) {
        if (existsSync(savedFilePath)) {
            break;
        }
        await new Promise((resolve, reject) => {
            setTimeout(resolve, 100);
        });
    }
    return savedFilePath;
};

const fetchGithubRepository: AssetFetcher = async (version, saveTo) => {
    const versionName = version.startsWith('v') ? version : `v${version}`
    const link = `https://github.com/simplito/privmx-webendpoint/releases/download/${versionName}/privmx-webendpoint-${versionName}.zip`
    const fileName = link.split('/').pop() || 'wasm-assets.zip';
    const resp = await fetch(link);
    const savedFilePath = join(saveTo, fileName);
    if (resp.ok && resp.body) {
        let writer = createWriteStream(savedFilePath);
        Readable.fromWeb(resp.body as any).pipe(writer);
    }
    while (true) {
        if (existsSync(savedFilePath)) {
            break;
        }
        await new Promise((resolve, reject) => {
            setTimeout(resolve, 100);
        });
    }
    return savedFilePath;
}

async function extractAssets(archivePath: string, extractPath: string): Promise<void> {
    const assetsZip = new AdmZip(join(process.cwd(), archivePath));
    assetsZip.getEntries().forEach(zipFile => {
        if (zipFile.name.endsWith('js') || zipFile.name.endsWith('.wasm')) {
            assetsZip.extractEntryTo(zipFile, extractPath, false);
        }
    });
}

async function clearArchive(archivePath: string) {
    if (existsSync(archivePath)) {
        await rm(archivePath);
    }
}

async function checkDestPath(destPath: string) {
    if (existsSync(destPath)) {
        const override = await confirm({ message: 'Assets already exists, override ?', default: false });
        if (override) {
            await rm(destPath, { recursive: true, force: true });
            return false;
        }
        return true;
    } else {
        return false;
    }
}

async function choseDestFolder() {
    const destinationFolder = await input({
        message:
            'Please specify the destination folder for the assets (e.g., ./public/privmx-assets):',
        default: './public/privmx-assets'
    });

    return destinationFolder;
}

async function setupNext(destinationFolder: string) {

    console.log('\n-- Paste following script tags in to your root layout <head> tag --');
    const withoutPublic = destinationFolder.replace('/public', '');

    console.log(`\x1b[34m
<Script src="${withoutPublic}/privmx-endpoint-web.js"></Script>
<Script src="${withoutPublic}/driver-web-context.js"></Script>
<Script src="${withoutPublic}/endpoint-wasm-module.js"></Script>\x1b[0m\n`);

    await pressEnterToContinue();

    console.log('-- Setup your next.config.mjs to handle specified headers --');

    console.log(`\x1b[34m
/** @type {import("next").NextConfig} */
const nextConfig = {
    headers: async () => {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Cross-Origin-Embedder-Policy",
                        value: "require-corp",
                    },
                    {
                        key: "Cross-Origin-Opener-Policy",
                        value: "same-origin",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
\x1b[0m
`);
}

async function setupVite(destinationFolder: string) {

    console.log('\n-- Paste following script tags in to your index.html <head> tag --');
    const withoutPublic = destinationFolder.replace('/public', '');

    console.log(`\x1b[34m
<script src="${withoutPublic}/privmx-endpoint-web.js"></script>
<script src="${withoutPublic}/driver-web-context.js"></script>
<script src="${withoutPublic}/endpoint-wasm-module.js"></script>\x1b[0m\n`);

    await pressEnterToContinue();

    console.log('-- Setup your vite.config.ts to handle specified headers --\n');

    console.log(`\x1b[34m
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          next();
        });
      },
    },
  ],
});
\x1b[0m
`);
}


type PackageJsonDependencies = [dependencies: Record<string, string>, devDependencies: Record<string, string>]

function getProjectDependencies(): PackageJsonDependencies {
    const packageJsonPath: string = join(process.cwd(), 'package.json');
    if (!existsSync(packageJsonPath)) {
        console.log('No package.json found. Exiting...');
        process.exit(1);
    }

    let packageJson: any;
    try {
        const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
        packageJson = JSON.parse(packageJsonContent);
    } catch (error) {
        console.error('Error reading or parsing package.json:', error);
        process.exit(1);
    }
    const dependencies: Record<string, string> = packageJson.dependencies || {};
    const devDependencies: Record<string, string> = packageJson.devDependencies || {};

    return [dependencies, devDependencies];
}

const PROJECT_TYPES = [
    {
        name: 'Vite',
        matchFn: async (packageJson) => {
            const [dep, devDep] = packageJson;
            const isVite = 'vite' in dep || 'vite' in devDep;
            return isVite;
        },
        setup: async (assetsPath) => {
            await setupVite(assetsPath);
        }
    },
    {
        name: 'Next',
        matchFn: async (packageJson) => {
            const [dep, devDep] = packageJson;
            const isNext = 'next' in dep || 'next' in devDep;
            return isNext;
        },
        setup: async (assetsPath) => {
            await setupNext(assetsPath);
        }
    }
] satisfies ProjectType[];

const DEFAULT_PROJECT_TYPE = {
    name: 'Default',
    matchFn: async () => {
        console.log('Unknown project type');
        return true;
    },
    setup: async () => {

    }
} satisfies ProjectType;


function extractParam(params: string[]): { version?: string, repository?: string } {
    const args = {};

    const repositoryArg = params.find(param => param.startsWith('--repository'));
    if (repositoryArg) {
        Object.assign(args, { repository: repositoryArg.split('=')[1] });
    }

    const versionArg = params.find(param => param.startsWith('--version'));
    if (versionArg) {
        Object.assign(args, { version: versionArg.split('=')[1] });
    }


    return args;
}

async function main() {
    const params = extractParam(process.argv);
    const projectDependencies = getProjectDependencies();

    let userProjectType: ProjectType = DEFAULT_PROJECT_TYPE;
    for (const projectType of PROJECT_TYPES) {
        if (await projectType.matchFn(projectDependencies)) {
            console.log(`Detected as ${projectType.name} project`);
            const answer = await confirm({ message: 'Please confirm if detected properly: Y/N' });
            if (!answer) {
                continue;
            }

            userProjectType = projectType;
            break;
        }
    }

    // get versions
    // select version
    const version = params.version ?? 'v2.0.2';

    // select folder
    const destFolder = await choseDestFolder();

    //check if assets exists
    const abort = await checkDestPath(destFolder);
    if (abort) {
        process.exit(0);
    }

    // fetch assets
    let fetcher: AssetFetcher;
    console.log("Webendpoint manager")
    const spinner = ora(`Fetching assets version ${version}`).start();
    if (params.repository && params.repository.startsWith('https://builds.s24')) {
        fetcher = fetchInternalRepository;
    } else {
        fetcher = fetchPublicRepository;
    }

    const fetchedAsset = await fetcher(version, './');

    // extract assets
    spinner.text = 'Extracting...';
    await extractAssets(fetchedAsset, destFolder);
    await clearArchive(fetchedAsset);
    spinner.succeed(`Assets fetched to: ${destFolder}`);
    await userProjectType.setup(destFolder);
}

main()
    .then(() => {
        console.log(
            'For more information please visit our documentation: https://docs.privmx.cloud/'
        );
    })
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
