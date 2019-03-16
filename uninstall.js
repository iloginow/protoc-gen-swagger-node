const path = require('path');
const fs = require('fs');

// Mapping between Node's `process.platform` to Golang's
const PLATFORM_MAPPING = {
  darwin: 'darwin',
  linux: 'linux',
  win32: 'windows',
};

const platform = PLATFORM_MAPPING[process.platform];

const binName = (platform === 'windows')
  ? 'protoc-gen-swagger.exe'
  : 'protoc-gen-swagger';

const parentBinDirPath = path.resolve(__dirname, '../.bin');
const parentBinFilePath = path.resolve(parentBinDirPath, `./${binName}`);

if (fs.existsSync(parentBinDirPath)) {
  fs.unlinkSync(parentBinFilePath);
}
