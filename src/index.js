const VirtualMachine = require('./virtual-machine');
const FileReader = require('filereader');
const File = require('file-class');
const yargs = require('yargs');

const minilog = require('minilog');
const log = minilog('standalone-vm');
minilog.enable();

const argv = yargs
    .command('$0', 'the default command to override localhost', {
        host: {
            type: 'string',
            description: 'address to connect to',
            default: 'localhost'
        }
    })
    .positional('port', {
        type: 'string',
        desc: 'assign other than default',
        default: '1883'
    })
    .positional('game', {
        describe: 'path to non-default game',
        default: `${process.cwd()}/game/DefaultGame.sb3`
    })
    .help()
    .argv;

const host = argv.host;
const port = argv.port;
const gamePath = argv.game;

const virtualMachine = new VirtualMachine();

if (process.title !== 'browser') {

    const file = new File('DefaultGame.sb3', {
        name: 'DefaultGame.sb3',
        path: gamePath
    });
    const reader = new FileReader();

    reader.onload = () => {
        log.info(`Loading ${gamePath} to DefaultGame.sb3`);
        virtualMachine.loadProject(reader.result);
    };
    // params: (extensionId, peripheralId, port, userName, password)
    virtualMachine.connectMqtt('playspot', host, port, '', '');
    reader.onerror = error => {
        log.info('No DefaultGame.sb3, exiting');
        process.exit();
    };
    
    reader.readAsArrayBuffer(file);
}

virtualMachine.start();

module.exports = VirtualMachine;
