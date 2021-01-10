"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const io = __importStar(require("@actions/io"));
const IS_WINDOWS = process.platform === 'win32';
const VS_VERSION = core.getInput('vs-version') || 'latest';
const VSWHERE_PATH = core.getInput('vswhere-path');
const PUBLISHER_ACCESS_TOKEN = core.getInput('personal-access-code');
const PUBLISH_MANIFEST_FILE = core.getInput('publish-manifest-file');
const EXTENSION_FILE = core.getInput('extension-file');
let VSWHERE_EXEC = '-products * -requires Microsoft.Component.MSBuild -property installationPath -latest ';
if (VS_VERSION !== 'latest') {
    VSWHERE_EXEC += `-version "${VS_VERSION}" `;
}
core.debug(`Execution arguments: ${VSWHERE_EXEC}`);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (IS_WINDOWS === false) {
                core.setFailed('VSIX Publisher can only be run on Windows runners');
                return;
            }
            // check to see if we are using a specific path for vswhere
            let vswhereToolExe = '';
            if (VSWHERE_PATH) {
                core.debug(`Using given vswhere-path: ${VSWHERE_PATH}`);
                vswhereToolExe = path.join(VSWHERE_PATH, 'vswhere.exe');
            }
            else {
                try {
                    const vsWhereInPath = yield io.which('vswhere', true);
                    core.debug(`Found tool in PATH: ${vsWhereInPath}`);
                    vswhereToolExe = vsWhereInPath;
                }
                catch (_a) {
                    vswhereToolExe = path.join(process.env['ProgramFiles(x86)'], 'Microsoft Visual Studio\\Installer\\vswhere.exe');
                    core.debug(`Trying Visual Studio-installed path: ${vswhereToolExe}`);
                }
            }
            if (!fs.existsSync(vswhereToolExe)) {
                core.setFailed('VSIX Publisher requires the path to where vswhere.exe exists');
                return;
            }
            let vsixPublisherPath = '';
            const vsWhereOptions = {};
            vsWhereOptions.listeners = {
                stdout: (data) => {
                    const installationPath = data.toString().trim();
                    core.debug(`Found installation path: ${installationPath}`);
                    vsixPublisherPath = path.join(installationPath, 'VSSDK\\VisualStudioIntegration\\Tools\\Bin\\VsixPublisher.exe');
                }
            };
            yield exec.exec(`"${vswhereToolExe}" ${VSWHERE_EXEC}`, [], vsWhereOptions);
            if (!vsixPublisherPath || !fs.existsSync(vsixPublisherPath)) {
                core.setFailed('Unable to find VsixPublisher');
                return;
            }
            yield exec.exec(`"${vsixPublisherPath}" publish -personalAccessToken ${PUBLISHER_ACCESS_TOKEN}  -payload ${EXTENSION_FILE} -publishManifest ${PUBLISH_MANIFEST_FILE}`);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
