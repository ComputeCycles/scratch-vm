const VirtualMachine = require('./virtual-machine');
const FileReader = require('filereader');
const File = require('file-class');

const minilog = require('minilog');
const log = minilog('standalone-vm');
minilog.enable();

const virtualMachine = new VirtualMachine();
const file = new File('DefaultGame.sb3', {
    name: 'DefaultGame.sb3',
    path: `${process.cwd()}/game/DefaultGame.sb3`
});
const reader = new FileReader();
reader.onload = () => {
    log.info(`Loading ${process.cwd()}/game/DefaultGame.sb3`);
    virtualMachine.loadProject(reader.result);
    // params: (extensionId, peripheralId, userName, password)
};
virtualMachine.connectMqtt('playspot', '10.8.0.28', '', '');
reader.onerror = error => {
    log.info('No DefaultGame.sb3, exiting');
    process.exit();
};

reader.readAsArrayBuffer(file);

virtualMachine.start();

module.exports = VirtualMachine;