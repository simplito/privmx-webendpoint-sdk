#!/usr/bin/env node

import { confirm, input } from '@inquirer/prompts';
import { join, resolve as pathResolve } from 'path';
import { rm } from 'node:fs/promises';
import { existsSync, readFileSync, createWriteStream, renameSync, mkdirSync, rmSync } from 'fs';
import { Readable } from 'stream';
import * as cp from 'child_process';
import * as UUID from 'uuid';

// @ts-ignore
import AdmZip from 'adm-zip';
import ora from 'ora';

type ProjectType = {
    name: string;
    matchFn: (pckgJson: PackageJsonDependencies) => Promise<boolean>;
    setup: (assetsPath: string) => Promise<void>;
};

interface AssetResult {
    path: string;
    isCompressed: boolean;
    cleanup?: Function;
}

type AssetFetcher = (version: string, saveTo: string) => Promise<AssetResult>;

async function pressEnterToContinue() {
    await input({
        message: 'Press ENTER to continue'
    });
}

async function getZipUrlOfLatest() {
    const latestInfoUrl =
        'https://api.github.com/repos/simplito/privmx-webendpoint/releases/latest';
    const headers = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
    };

    const zipInfo = await fetch(latestInfoUrl, { headers });
    if (zipInfo.ok) {
        return (await zipInfo.json()).zipball_url;
    }
    return null;
}

const fetchGithubRepository: AssetFetcher = async (version, saveTo) => {
    const actualVersion = version ? version : (await getZipUrlOfLatest()).split('/').pop();
    const versionName = actualVersion.startsWith('v') ? actualVersion : `v${actualVersion}`;
    const link = `https://github.com/simplito/privmx-webendpoint/releases/download/${versionName}/privmx-webendpoint-${versionName}.zip`;

    const fileName = link.split('/').pop() || 'wasm-assets.zip';
    const resp = await fetch(link, { redirect: 'follow' });
    const savedFilePath = join(saveTo, fileName);

    if (existsSync(savedFilePath)) {
        await rm(savedFilePath);
    }
    if (resp.ok && resp.body) {
        const writer = createWriteStream(savedFilePath);
        Readable.fromWeb(resp.body as any).pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } else {
        throw new Error('Unable to download assets aborting.');
    }
    return { path: savedFilePath, isCompressed: true };
};

const fetchNpmJSPackage: AssetFetcher = async (version, saveTo) => {
    const versionName = version.startsWith('v') ? version.substring(1) : version;
    const pkgName = `@simplito/privmx-webendpoint${version.length > 0 ? '@' + versionName : ''}`;

    let tmpPkgDir: string = '';
    while (true) {
        tmpPkgDir = pathResolve(saveTo, 'tmp-' + UUID.v4());
        if (!existsSync(tmpPkgDir)) {
            break;
        }
    }
    mkdirSync(tmpPkgDir, { recursive: true });

    cp.execSync('npm init -y', { cwd: tmpPkgDir });

    cp.execSync('npm i ' + pkgName, { cwd: tmpPkgDir });

    const assetsPath = pathResolve(
        tmpPkgDir,
        'node_modules/@simplito/privmx-webendpoint/webAssets'
    );

    const licenseFile = pathResolve(assetsPath, 'LICENSE.md');
    rmSync(licenseFile);
    return {
        path: assetsPath,
        isCompressed: false,
        cleanup: () => {
            rmSync(tmpPkgDir, { recursive: true, force: true });
        }
    };
};

async function extractAssets(archivePath: string, extractPath: string): Promise<void> {
    const assetsZip = new AdmZip(join(process.cwd(), archivePath));
    assetsZip.getEntries().forEach((zipFile) => {
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
        const override = await confirm({
            message: 'Assets already exists, override ?',
            default: false
        });
        if (override) {
            await rm(destPath, { recursive: true, force: true });
            return false;
        }
        return true;
    } else {
        return false;
    }
}

async function getLicenseConfirmation() {
    const confirmation = await confirm({
        message:
            'PrivMX Endpoint and PrivMX Bridge are licensed under the PrivMX Free License.\n' +
            '  See the License for the specific language governing permissions and limitations under the License at https://privmx.dev/licensing, proceed ?',
        default: true
    });

    return confirmation;
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

type PackageJsonDependencies = [
    dependencies: Record<string, string>,
    devDependencies: Record<string, string>
];

function getProjectDependencies(): PackageJsonDependencies {
    const packageJsonPath: string = join(process.cwd(), 'package.json');
    if (!existsSync(packageJsonPath)) {
        ora('No package.json found. Exiting...').fail();
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
    setup: async () => {}
} satisfies ProjectType;

function extractParam(params: string[]): { version?: string; repository?: string } {
    const args = {};

    const repositoryArg = params.find((param) => param.startsWith('--repository'));
    if (repositoryArg) {
        Object.assign(args, { repository: repositoryArg.split('=')[1] });
    }

    const versionArg = params.find((param) => param.startsWith('--version'));
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
            const answer = await confirm({
                message: `Detected as ${projectType.name} project 
  Please confirm if detected properly: Y/N`
            });
            if (!answer) {
                continue;
            }

            userProjectType = projectType;
            break;
        }
    }

    // get versions
    // select version
    const version = params.version ? params.version : '';

    // select folder
    const destFolder = await choseDestFolder();

    //check if assets exists
    const abort = await checkDestPath(destFolder);
    if (abort) {
        process.exit(0);
    }

    const isLicenseAccepted = await getLicenseConfirmation();

    if (!isLicenseAccepted) {
        ora('License not accepted, aborting...').fail();
        process.exit(0);
    }

    // fetch assets
    let fetcher: AssetFetcher;
    const spinner = ora(
        `Fetching assets of version: ${version.length > 0 ? version : 'latest'}`
    ).start();
    if (params.repository && params.repository.startsWith('https://github.com/simplito')) {
        fetcher = fetchGithubRepository;
    } else {
        fetcher = fetchNpmJSPackage;
    }

    try {
        const fetchedAsset = await fetcher(version, './');
        if (fetchedAsset.isCompressed) {
            spinner.text = 'Extracting...';
            await extractAssets(fetchedAsset.path, destFolder);
            await clearArchive(fetchedAsset.path);
        } else {
            renameSync(fetchedAsset.path, destFolder);
            if (fetchedAsset.cleanup) {
                fetchedAsset.cleanup();
            }
        }
        spinner.succeed(`Assets fetched to: ${destFolder}`);
        await userProjectType.setup(destFolder);
    } catch (e) {
        if (e instanceof Error && e.name === 'ExitPromptError') {
            spinner.fail('Aborting script...');
            return;
        }
        spinner.fail(e.message || e);
    }

    // extract assets
}

main()
    .then(() => {
        ora('For more information please visit our documentation: https://docs.privmx.dev/').info();
    })
    .catch((e) => {
        if (e instanceof Error && e.name === 'ExitPromptError') {
            ora('Aborting script...').fail();
            return;
        }
        console.error(e);
        process.exit(1);
    });
