const Cast = require('../util/cast');

class Scratch3MicroworldBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        this.nativeCallbacks = {};

        this._nativeCallback = this._nativeCallback.bind(this);

        if (this.runtime) {
            this.runtime.on('NATIVE_CALLBACK', this._nativeCallback);
        }
    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            event_whenmoved: this.movedGreaterThan,
            sound_texttospeech: this.textToSpeech,
            sound_nativestartsound: this.startSound,
            sound_nativeplaymusic: this.playMusic,
            sound_nativepausemusic: this.pauseMusic,
            looks_showimagefor: this.showImageFor,
            more_shakefor: this.shakeFor
        };
    }

    getHats () {
        return {
            event_whenmoved: {
                restartExistingThreads: false,
                edgeActivated: true
            }
        };
    }

    _nativeCallback (id) {
        const callback = this.nativeCallbacks[id];
        if (callback) {
            callback();
            delete this.nativeCallbacks[id];
        }
    }

    movedGreaterThan (args) {
        const value = Cast.toNumber(args.VALUE);
        return this.runtime.getMovement() > value;
    }

    startSound (args) {
        const sound = Cast.toString(args.SOUNDS);
        this.runtime.emit('ANDROID_NATIVE', {
            type: 'startSound',
            value: sound
        });
    }

    textToSpeech (args) {
        return new Promise(resolve => {
            const id = Math.round(Math.random() * Math.pow(2, 16));
            this.nativeCallbacks[id] = resolve;
            this.runtime.emit('ANDROID_NATIVE', {
                type: 'textToSpeech',
                value: args.MESSAGE,
                callbackId: id
            });
        });
    }

    playMusic () {
        this.runtime.emit('ANDROID_NATIVE', {
            type: 'musicPlayer',
            value: 'play'
        });
    }

    pauseMusic () {
        this.runtime.emit('ANDROID_NATIVE', {
            type: 'musicPlayer',
            value: 'pause'
        });
    }

    showImageFor (args) {
        const index = Cast.toNumber(args.VALUE);
        const dur = Cast.toNumber(args.DURATION);
        this.runtime.emit('ANDROID_SHOW_IMAGE', index);
        return new Promise(resolve => {
            setTimeout(() => {
                this.runtime.emit('ANDROID_HIDE_IMAGE');
                resolve();
            }, dur * 1000);
        });
    }

    shakeFor (args) {
        const dur = Cast.toNumber(args.DURATION);
        this.runtime.emit('ANDROID_NATIVE', {
            type: 'shake',
            value: dur
        });
        return new Promise(resolve => {
            setTimeout(resolve, dur * 1000);
        });
    }

}

module.exports = Scratch3MicroworldBlocks;
