const VirtualMachine = require('./virtual-machine');
const FileReader = require('filereader');
const File = require('file-class');

const minilog = require('minilog');
const log = minilog('standalone-vm');
minilog.enable();

const virtualMachine = new VirtualMachine();
const file = new File('DefaultGame.sb3', {
    name: 'DefaultGame.sb3',
    path: `${process.cwd()}/DefaultGame.sb3`
});
const reader = new FileReader();
reader.onload = () => {
    log.info('Loading DefaultGame.sb3');
    virtualMachine.loadProject(reader.result);
};
reader.onerror = error => {
    log.info('No DefaultGame.sb3, exiting');
    process.exit();
};

reader.readAsArrayBuffer(file);
// virtualMachine.loadProject(reader.result);
virtualMachine.start();

module.exports = VirtualMachine;
