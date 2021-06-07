const VirtualMachine = require('./virtual-machine');
const FileReader = require('filereader');
const File = require('file-class');
const minilog = require('minilog');
const log = minilog('standalone-vm');
const {Command} = require('commander');
minilog.enable();

const program = new Command();
program
    .option('-h, --host [address]', 'connection address')
    .option('-p, --port [number]', 'mqtt port')
    .option('-g, --game [filepath]', 'path to game');
program.parse(process.argv);
const inputs = program.opts();
    
const virtualMachine = new VirtualMachine();
    
if (process.title === 'browser') {

    virtualMachine.start();

} else {

    virtualMachine.start();
    const host = inputs.host ? `${inputs.host}` : 'localhost';
    const port = inputs.port ? `${inputs.port}` : '1883';
    const gamePath = inputs.game ? `${inputs.game}` : `${process.cwd()}/game/DefaultGame.sb3`;
    // params: (extensionId, peripheralId/connection address, port, userName, password)
    virtualMachine.connectMqtt('playspot', host, port, '', '');
    
    const reader = new FileReader();
    
    const file = new File('DefaultGame.sb3', {
        name: 'DefaultGame.sb3',
        path: gamePath
    });

    reader.readAsArrayBuffer(file);

    reader.onload = () => {
        log.info(`Loading ${gamePath} to DefaultGame.sb3`);
        virtualMachine.loadProject(reader.result);
    };
    reader.onerror = error => {
        log.info('No DefaultGame.sb3, exiting');
        process.exit();
    };
    
}


module.exports = VirtualMachine;
