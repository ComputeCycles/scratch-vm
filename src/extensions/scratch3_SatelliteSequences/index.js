/* eslint-disable no-loop-func */
/* eslint-disable no-return-assign */
const EventEmitter = require('events');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const encoder = new TextEncoder();
const vm = window.vm;
const original = require('./Assets/originalCostume');
const mqtt = require('mqtt');

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
const blockIconURI =
    // eslint-disable-next-line max-len
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDE5LTAxLTA0VDE5OjI4OjUzPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5GbHlpbmcgTWVhdCBBY29ybiA2LjIuMzwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6Q29tcHJlc3Npb24+NTwvdGlmZjpDb21wcmVzc2lvbj4KICAgICAgICAgPHRpZmY6UGhvdG9tZXRyaWNJbnRlcnByZXRhdGlvbj4yPC90aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+CiAgICAgICAgIDx0aWZmOlhSZXNvbHV0aW9uPjcyPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KNVxrxwAAIgZJREFUeAGtm2mQJMd1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';


class Scratch3Satellite extends EventEmitter {
    constructor (runtime) {
        super();
        /**
         * The Scratch 3.0 runtime
         * @type {Runtime}
         * @private
         */
        this.runtime = runtime;

        /**
         * The storage module for the VM/runtime
         * @param {ScratchStorage} storage The storage module to attach
         */
        const storage = this.runtime.storage;

        /**
         * MQTT Client for light sequence
         * @type {MQTT Client}
         * @private
         */
        // eslint-disable-next-line no-unused-expressions
        this._client;
        this._client = mqtt.connect('ws://broker.mqttdashboard.com:8000/mqtt');

        /**
         * Previous positions of light sequence
        @type {Array}
        */
        this._prevPositions = [];

        /**
         * Active state of a thread
        @type {Boolean}
        */
        this._active = false;

        /**
         * The message being passed from MQTT
        @type {String}
        */
        this._message = '';

        /**
         * The running timer for sequencing.
        @type {String}
        */
        this._time = 0;

        /**
         * Event listen to set this._active to true
         */
        this.on('started', () => {
            this._active = true;
        });

        /**
         * Satellite info for other users to subscribe to
         */
        this._currentUsersSatellite = window.location.host;

        /**
         * Event listen to set this._active to true
         */
        this._satelliteToPublishTo = '';

        // eslint-disable-next-line no-console
        console.log(this._currentUsersSatellite, 'test');

        this._time = 0;
        this._message = '';

        // eslint-disable-next-line no-console
        console.log(runtime, 'runtime');

        // // eslint-disable-next-line no-console
        // console.log(Thread.STATUS_DONE, 'status done?');

        this.on('over', () => {
            this._time = 0;
            this._message = '';
            // eslint-disable-next-line no-console
            console.log('disposed');
        });

        /**
         * Event listen to set this._active to false
         * Resets the timing for the sequences and resets the message from MQTT.
         */
        this.on('over', () => {
            this._active = false;
        });

        /**
         * Event listen to subscribe to sequencing topic once connected.
         */
        this._client.on('connect', () => {
            // eslint-disable-next-line no-console
            console.log('connected', +this._client.connected);
            this._client.subscribe(`${this._currentUsersSatellite}/cmd/fx`, () => {
                // eslint-disable-next-line no-console
                console.log(`subscribed to ${this._currentUsersSatellite}/cmd/fx`);
            });
        });

        /**
         * Event listen on any messages
         */
        this._client.on('message', (topic, message, packet) => {
            this._message = message.toString();
            this.startSequence(this._message);
        });

        /**
         * The backdrop for the project
        @type {SVG}
        */
        const backdropCostume = `<svg version="1.1" width="2" height="2" viewBox="-1 -1 2 2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                    <!-- Exported by Scratch - http://scratch.mit.edu/ -->
                                         </svg>`;

        
        /**
         * Encoding the backdrop SVG and Sprite SVG for the project
        @type {SVG}
        */
        const newSVG2 = encoder.encode(backdropCostume);
        const mainSVG = original.originalCostume;
        const svg = Object.values(mainSVG).join('');
        const newSVG = Cast.toString(svg);
        const costume1SVG = encoder.encode(newSVG);

        /**
         * Creating a new asset for backdrop costume and sprite costume from scratch storage.
        */
        const costume1Data = {};
        costume1Data.asset = storage.createAsset(
            storage.AssetType.ImageVector,
            storage.DataFormat.SVG,
            costume1SVG,
            null,
            true // generate md5
        );
        costume1Data.dataFormat = storage.DataFormat.SVG;
        costume1Data.assetId = costume1Data.asset.assetId;
        costume1Data.md5 = `${costume1Data.assetId}.${costume1Data.dataFormat}`;
        costume1Data.name = 'Satellite1';
        costume1Data.rotationCenterX = 28;
        costume1Data.rotationCenterY = 23;

        const backdrop = {};
        backdrop.asset = storage.createAsset(
            storage.AssetType.ImageVector,
            storage.DataFormat.SVG,
            newSVG2,
            null,
            true
        );
        backdrop.dataFormat = storage.DataFormat.SVG;
        backdrop.assetId = backdrop.asset.assetId;
        backdrop.md5 = `${backdrop.assetId}.${backdrop.dataFormat}`;
        backdrop.name = 'backdrop1';
        backdrop.rotationCenterX = 243.00000000000003;
        backdrop.rotationCenterY = 182.96698836567242;

        /**
         * Creating a new project for the extension
        @type {Object}
        */
        const newProject = {
            targets: [
                {
                    isStage: true,
                    name: 'Stage',
                    variables: {'`jEk@4|i[#Fk?(8x)AV.-my variable': [ 'my variable', 0]},
                    lists: {},
                    broadcasts: {},
                    blocks: {},
                    comments: {},
                    currentCostume: 0,
                    costumes: [backdrop],
                    sounds: [],
                    volume: 100,
                    layerOrder: 0,
                    tempo: 60,
                    videoTransparency: 50,
                    videoState: 'on',
                    textToSpeechLanguage: null
                },
                {
                    isStage: false,
                    name: 'Satellite1',
                    variables: {},
                    lists: {},
                    broadcasts: {},
                    blocks: {},
                    comments: {},
                    currentCostume: 0,
                    costumes: [costume1Data],
                    sounds: [
                        {
                            assetId: '83a9787d4cb6f3b7632b4ddfebf74367',
                            name: 'pop',
                            dataFormat: 'wav',
                            format: '',
                            rate: 44100,
                            sampleCount: 1032,
                            md5ext: '83a9787d4cb6f3b7632b4ddfebf74367.wav'
                        }
                    ],
                    volume: 100,
                    layerOrder: 1,
                    visible: true,
                    x: -109,
                    y: 124,
                    size: 175,
                    direction: 90,
                    draggable: false,
                    rotationStyle: 'all around'
                }
            ],
            monitors: [],
            extensions: [],
            meta: {
                semver: '3.0.0',
                vm: '0.2.0',
                agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'
            }
        };
        vm.loadProject(JSON.stringify(newProject));
    }

    getInfo () {
        return {
            id: 'sequence',
            name: 'Satellite Sequence',
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'startSequence',
                    blockType: BlockType.COMMAND,
                    text: 'Start Sequence[LIGHT]',
                    arguments: {
                        LIGHT: {
                            type: ArgumentType.LIGHT,
                            defaultValue: 'Light1'
                        }
                    }
                },
                {
                    opcode: 'addPosition',
                    blockType: BlockType.REPORTER,
                    text: 'Add Position [LIGHT] and [LIGHT2]',
                    arguments: {
                        LIGHT: {
                            type: ArgumentType.LIGHT
                        },
                        LIGHT2: {
                            type: ArgumentType.LIGHT
                        }
                    }
                },
                {
                    opcode: 'sequenceSpeed',
                    blockType: BlockType.COMMAND,
                    text: 'Delay [DURATION] Seconds',
                    arguments: {
                        DURATION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'rotateOneClockwise',
                    blockType: BlockType.COMMAND,
                    text: 'Rotate One Spot Clockwise'
                },
                {
                    opcode: 'sequence1',
                    blockType: BlockType.REPORTER,
                    text: 'Sequence 1'
                },
                {
                    opcode: 'sequence2',
                    blockType: BlockType.REPORTER,
                    text: 'Sequence 2'
                },
                {
                    opcode: 'sequence3',
                    blockType: BlockType.REPORTER,
                    text: 'Sequence 3'
                },
                {
                    opcode: 'sendMessage',
                    blockType: BlockType.COMMAND,
                    text: 'Send MQTT [MESSAGE]',
                    arguments: {
                        MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Message'
                        }
                    }
                },
                {
                    opcode: 'setSubscription',
                    blockType: BlockType.COMMAND,
                    text: 'Set Satellite Publish ID [SATELLITE]',
                    arguments: {
                        SATELLITE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'SatelliteId'
                        }
                    }
                },
                {
                    opcode: 'startBlock',
                    blockType: BlockType.COMMAND,
                    text: 'Starting Block'
                }
            ]
        };
    }

    sequenceSpeed (args, util) {
        if (util.stackTimerNeedsInit()) {
            const duration = Cast.toNumber(args.DURATION) * 1000;
            // eslint-disable-next-line no-console
            console.log(duration, 'duration');
            util.startStackTimer(duration);
            this.runtime.requestRedraw();
            util.yield();
        } else if (!util.stackTimerFinished()) {
            util.yield();
        }
    }

    /**
     * Updating the SVG of the currentCostume
     * @param {number} costumeIndex - the index of the costume
     * @param {object} svg - the svg of the costume.
     * @param {number} rotationCenterX - the X axis of the costume.
     * @param {number} rotationCenterY - the Y axis of the costume.
     */
    updateSvg (costumeIndex, svg, rotationCenterX, rotationCenterY) {
        const costume = vm.editingTarget.getCostumes()[costumeIndex];
        if (costume && this.runtime && this.runtime.renderer) {
            costume.rotationCenterX = rotationCenterX;
            costume.rotationCenterY = rotationCenterY;
            this.runtime.renderer.updateSVGSkin(costume.skinId, svg, [rotationCenterX, rotationCenterY]);
            costume.size = this.runtime.renderer.getSkinSize(costume.skinId);
        }
        const storage = this.runtime.storage;
        // If we're in here, we've edited an svg in the vector editor,
        // so the dataFormat should be 'svg'
        costume.dataFormat = storage.DataFormat.SVG;
        costume.bitmapResolution = 1;
        costume.asset = storage.createAsset(
            storage.AssetType.ImageVector,
            costume.dataFormat,
            encoder.encode(svg),
            null,
            true // generate md5
        );
        costume.assetId = costume.asset.assetId;
        costume.md5 = `${costume.assetId}.${costume.dataFormat}`;
        vm.emitTargetsUpdate();
    }

    /**
     * Starting the sequence
     * @param {object} args - a light sequence id.
     */
    startSequence (args) {
        let seq = '';
        this.emit('started');
        if (this._message === ''){
            seq = Cast.toString(args.LIGHT);
        } else {
            seq = this._message;
        }
        const Parse = require('./parse-sequence');
        const parser = new Parse();
        const color = '';
        const stringSplit = seq.split(',');
        const filteredList = stringSplit.filter(e => e === 0 || e);
        let arrayLength = filteredList.length;
        let k = 0;
        while (arrayLength > 0) {
            if (filteredList[k].includes('L')) {
                const newTime = filteredList[k].slice(14);
                const copyOfCostume = parser.parseSingleInput(filteredList[k], this._prevPositions, color);

                setTimeout(() => {
                    const svg = Object.values(copyOfCostume).join('');
                    // this.updateSvg(util.target.currentCostume, svg, 28, 23);
                    this.updateSvg(0, svg, 28, 23);
                }, this._time += Cast.toNumber(newTime));

            } else {
                const newCostumeSVG2 = original.originalCostume;
                const copyOfCostumeToBeChanged = {};
                Object.assign(copyOfCostumeToBeChanged, newCostumeSVG2);
                this._prevPositions.length = 0;
                const delayTime = filteredList[k].slice(2);
                setTimeout(() => {
                    const svg = Object.values(copyOfCostumeToBeChanged).join('');
                    this.updateSvg(0, svg, 28, 23);
                }, this._time += Cast.toNumber(delayTime));
            }
            arrayLength--;
            k++;
        }
        // this.emit('over');
        // eslint-disable-next-line no-console
        console.log('runtime', this.runtime);
        // const doneThreads = this.runtime.sequencer.stepThreads();
        // // eslint-disable-next-line no-console
        // this.runtime._emitProjectRunStatus(this.runtime._nonMonitorThreadCount);
    //     if (this.runtime.isActiveThread(this.runtime.threads)) {
    //         this.emit(Thread.STATUS_RUNNING);
    //     } else {
    //         this.emit(Thread.STATUS_DONE);
    //     }
    }

    sequence1 () {
        const lightsArray = [
            
            'L: 646400 FFFF 100',
            'D: 2000',

            'L: 000000 FFFF 100',
            'D: 300',

            'L: 646400 FFFF 100',
            'D: 600',

            'L: 000000 FFFF 100',
            'D: 300',

            'L: 646400 FFFF 100',
            'D: 600',

            'L: 000000 FFFF 100',
            'D: 100'
        ];
        const seq = lightsArray.join(',');
        return seq;
    }

    sequence2 () {
        const lightsArray = [
            
            
            'L: 646400 FFFF 1',
            'D: 200',

            'L: 000000 FFFF 1',
            'D: 200',

            'L: 000064 FE00 300',

            'L: 006464 00FE 300',

            'L: 646464 0101 300',

            'D: 300',

            'L: 646400 FFFF 1',
            'D: 200',

            'L: 000000 FFFF 1',
            'D: 200',

            'L: 000064 FE00 300',

            'L: 006464 00FE 300',

            'L: 646464 0101 300',
            'D: 200'

        ];
        const seq = lightsArray.join(',');
        return seq;
    }

    sequence3 () {
        const lightsArray = [
           
            'L: 006464 FE00 50',


            'L: 006400 00FE 50',


            'L: 646464 0101 50',
            'D: 50',

            'L: 006464 7E00 50',


            'L: 006400 017F 50',


            'L: 646464 8080 50',
            'D: 150',

            'L: 006464 3F80 50',


            'L: 006400 803F 50',


            'L: 646464 4040 50',
            'D: 150',

            'L: 006464 1FC0 50',


            'L: 006400 C01F 50',


            'L: 646464 2020 50',
            'D: 150',

            'L: 006464 0FE0 50',


            'L: 006400 E00F 50',


            'L: 646464 1010 50',
            'D: 150'
        ];
        const seq = lightsArray.join(',');
        return seq;
    }

    startBlock () {
        this._time = 0;
        this._message = '';
    }

    /**
     * Adding a another input to the input field
     * @param {object} args - the light positions
     * @return {string} lights - the string of sequence lines.
     */
    addPosition (args) {
        const light1 = Cast.toString(args.LIGHT);
        const light2 = Cast.toString(args.LIGHT2);
        const lights = [];
        lights.push(light1);
        lights.push(light2);
        return lights;
    }

    /**
     * Rotating every current light sequence one spot clockwise.
     * @param {object} util - the block utility
     */
    rotateOneClockwise (util) {
        const newCostumeSVG = original.originalCostume;
        const copyOfCostume = {};
        Object.assign(copyOfCostume, newCostumeSVG);
        const newPositions = [];
        let color = '';
        let length = this._prevPositions.length;
        const tempArray = [];
        if (length > 1) {
            let i = 0;
            while (length > 0) {
                const stringToEdit = this._prevPositions[i];
                const splitString = stringToEdit.split(',');
                const filteredString = splitString.filter(e => e === 0 || e);
                const theColor = filteredString.splice(0, 1);
                color = theColor;
                tempArray.push(color);
                filteredString.forEach(item => {
                    let newPosition = (+item + Cast.toNumber(1));
                    if (newPosition === 17) {
                        newPosition = 1;
                    }
                    copyOfCostume[`Light${newPosition}`] = `"#${color}"`;
                    tempArray.push(newPosition);
                });
                // eslint-disable-next-line no-loop-func
                i++;
                length--;
                let tempString = tempArray.join();
                newPositions.push(tempString);
                tempString = '';
                tempArray.length = 0;
            }
        } else {
            const singleLine = this._prevPositions.join();
            const singleString = singleLine.split(',');
            const theColor = singleString.splice(0, 1);
            color = theColor;
            tempArray.push(color);
            // eslint-disable-next-line no-loop-func
            singleString.map(item => {
                let newPosition = (+item + Cast.toNumber(1));
                if (newPosition === 17) {
                    newPosition = 1;
                }
                copyOfCostume[`Light${newPosition}`] = `"#${color}"`;
                tempArray.push(newPosition);
            });
            let tempString = tempArray.join();
            newPositions.push(tempString);
            tempString = '';
            tempArray.length = 0;
        }
        const svg = Object.values(copyOfCostume).join('');
        vm.updateSvg(0, svg, 28, 23);
        this._prevPositions.length = 0;
        // eslint-disable-next-line array-callback-return
        newPositions.map(move => {
            this._prevPositions.push(move);
        });
    }

    /**
     * The block to send a MQTT message
     * @param {object} args - the message to be sent to MQTT.
     */
    sendMessage (args) {
        const seq = Cast.toString(args.MESSAGE);
        const topic = this._satelliteToPublishTo;
        this._client.publish(topic, seq);
    }

    /**
     * The block to set a topic to publish to
     * @param {object} args - the message to be sent to MQTT.
     */
    setSubscription (args) {
        const id = Cast.toString(args.SATELLITE);
        this._satelliteToPublishTo = id;
    }


}
  

module.exports = Scratch3Satellite;
