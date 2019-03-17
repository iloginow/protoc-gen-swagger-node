const path = require('path');
const fs = require('fs');
const https = require('https');
const url = require('url');
const tar = require('tar');

const VERSION = '0.1.0';
const BIN_NAME = 'protoc-gen-swagger';

// Mapping from Node's `process.arch` to Golang's `$GOARCH`
const ARCH_MAPPING = {
  x64: 'amd64',
};

// Mapping between Node's `process.platform` to Golang's
const PLATFORM_MAPPING = {
  darwin: 'darwin',
  linux: 'linux',
  win32: 'windows',
};

const arch = ARCH_MAPPING[process.arch];
const platform = PLATFORM_MAPPING[process.platform];

const basePath = `https://github.com/iloginow/${BIN_NAME}/releases/download`;

const tarPath = `v${VERSION}/${BIN_NAME}_${VERSION}_${platform}_${arch}.tar.gz`;

const binDirPath = path.resolve(__dirname, './bin');
let binFilePath = path.resolve(binDirPath, `./${BIN_NAME}`);

const parentBinDirPath = path.resolve(__dirname, '../.bin');
let parentBinFilePath = path.resolve(parentBinDirPath, `./${BIN_NAME}`);

if (platform === 'windows') {
  binFilePath += '.exe';
  parentBinFilePath += '.exe';
}

async function install(res) {
  res.pipe(tar.x({ cwd: binDirPath }));
  fs.symlinkSync(binFilePath, parentBinFilePath);
}

if (!arch) throw new Error('Archtecture is not supported');
if (!platform) throw new Error('OS is not supported');

if (!fs.existsSync(parentBinDirPath)) {
  throw new Error('Parent .bin directory not found');
}

if (fs.existsSync(parentBinFilePath)) {
  fs.unlinkSync(parentBinFilePath);
}

if (fs.existsSync(binDirPath)) {
  if (fs.existsSync(binFilePath)) {
    fs.unlinkSync(binFilePath);
  }
} else {
  fs.mkdirSync(binDirPath);
}

https.get(`${basePath}/${tarPath}`, (res) => {
  const { statusCode, headers } = res;
  const { location } = headers;

  if (statusCode > 300 && statusCode < 400 && location) {
    if (url.parse(location).hostname) {
      https.get(location, install);
    } else {
      https.get(url.resolve(url.parse(url).hostname, location), install);
    }
  } else if (statusCode === 404) {
    throw new Error(`404 ${basePath}/${tarPath} download failed`);
  } else {
    install(res);
  }
}).on('error', (e) => {
  throw e;
});
