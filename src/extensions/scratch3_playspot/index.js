const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Variable = require('../../engine/variable.js');
const mqtt = require('mqtt');
const log = require('minilog')('playspot');
const http = require('http');
require('minilog').enable();

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDE5LTAxLTA0VDE5OjI4OjUzPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5GbHlpbmcgTWVhdCBBY29ybiA2LjIuMzwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6Q29tcHJlc3Npb24+NTwvdGlmZjpDb21wcmVzc2lvbj4KICAgICAgICAgPHRpZmY6UGhvdG9tZXRyaWNJbnRlcnByZXRhdGlvbj4yPC90aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+CiAgICAgICAgIDx0aWZmOlhSZXNvbHV0aW9uPjcyPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KNVxrxwAAIgZJREFUeAGtm2mQJMd1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';

const _volumes = Object.freeze({
    'Mute': '0',
    'Level 1': '50',
    'Level 2': '60',
    'Level 3': '70',
    'Level 4': '80',
    'Level 5': '90',
    'Level 6': '100'
});

const _sensitivities = Object.freeze({
    Near: 'set short',
    Medium: 'set medium',
    Far: 'set long',
    Max: 'set max'
});

const _images = Object.freeze({
    Eight: 'Eight',
    Empty: 'Empty',
    Farm: 'Farm',
    FarmFrame: 'FarmFrame',
    Five: 'Five',
    Four: 'Four',
    GameAgent: 'GameAgent',
    GameAgentFrame: 'GameAgentFrame',
    GameAnimals: 'GameAnimals',
    GameAnimalsFrame: 'GameAnimalsFrame',
    GameMusic: 'GameMusic',
    GameMusicFrame: 'GameMusicFrame',
    GameZombie: 'GameZombie',
    GameZombieFrame: 'GameZombieFrame',
    Go: 'Go',
    HeartFrame: 'HeartFrame',
    HeartFull: 'HeartFull',
    IconJungle: 'IconJungle',
    IconJungleFrame: 'IconJungleFrame',
    IconWeather: 'IconWeather',
    IconWeatherFrame: 'IconWeatherFrame',
    IdleFarm: 'IdleFarm',
    IdleFarmFrame: 'IdleFarmFrame',
    IdleMusic: 'IdleMusic',
    IdleMusicFrame: 'IdleMusicFrame',
    Jungle: 'Jungle',
    JungleFrame: 'JungleFrame',
    Music: 'Music',
    MusicFrame: 'MusicFrame',
    Nine: 'Nine',
    One: 'One',
    Seven: 'Seven',
    Six: 'Six',
    StarFrame: 'StarFrame',
    StarFull: 'StarFull',
    Ten: 'Ten',
    Three: 'Three',
    Two: 'Two',
    Weather: 'Weather',
    WeatherFrame: 'WeatherFrame'
});

const _sequences = Object.freeze({
    'Clear': 'LS: CLEAR',
    'Pause': 'LS: PAUSE',
    'Stop': 'LS: STOP',
    'Stop and Clear': 'LS: STOPCLEAR',
    'MusicPuzzle_01_spin1': 'LS: -1,MusicPuzzle_01_spin1.txt',
    'MusicPuzzle_01_spin2': 'LS: -1,MusicPuzzle_01_spin2.txt',
    'MusicPuzzle_01_spin3': 'LS: -1,MusicPuzzle_01_spin3.txt',
    'MusicPuzzle_01_spin4': 'LS: -1,MusicPuzzle_01_spin4.txt',
    'MusicPuzzle_01_spin5': 'LS: -1,MusicPuzzle_01_spin5.txt',
    'MusicPuzzle_02_spin1': 'LS: -1,MusicPuzzle_02_spin1.txt',
    'MusicPuzzle_02_spin2': 'LS: -1,MusicPuzzle_02_spin2.txt',
    'MusicPuzzle_02_spin3': 'LS: -1,MusicPuzzle_02_spin3.txt',
    'MusicPuzzle_02_spin4': 'LS: -1,MusicPuzzle_02_spin4.txt',
    'MusicPuzzle_02_spin5': 'LS: -1,MusicPuzzle_02_spin5.txt',
    'MusicPuzzle_03_spin1': 'LS: -1,MusicPuzzle_03_spin1.txt',
    'MusicPuzzle_03_spin2': 'LS: -1,MusicPuzzle_03_spin2.txt',
    'MusicPuzzle_03_spin3': 'LS: -1,MusicPuzzle_03_spin3.txt',
    'MusicPuzzle_03_spin4': 'LS: -1,MusicPuzzle_03_spin4.txt',
    'MusicPuzzle_03_spin5': 'LS: -1,MusicPuzzle_03_spin5.txt',
    'MusicPuzzle_04_spin1': 'LS: -1,MusicPuzzle_04_spin1.txt',
    'MusicPuzzle_04_spin2': 'LS: -1,MusicPuzzle_04_spin2.txt',
    'MusicPuzzle_04_spin3': 'LS: -1,MusicPuzzle_04_spin3.txt',
    'MusicPuzzle_04_spin4': 'LS: -1,MusicPuzzle_04_spin4.txt',
    'MusicPuzzle_04_spin5': 'LS: -1,MusicPuzzle_04_spin5.txt',
    'MusicPuzzle_05_spin1': 'LS: -1,MusicPuzzle_05_spin1.txt',
    'MusicPuzzle_05_spin2': 'LS: -1,MusicPuzzle_05_spin2.txt',
    'MusicPuzzle_05_spin3': 'LS: -1,MusicPuzzle_05_spin3.txt',
    'MusicPuzzle_05_spin4': 'LS: -1,MusicPuzzle_05_spin4.txt',
    'MusicPuzzle_05_spin5': 'LS: -1,MusicPuzzle_05_spin5.txt',
    'MusicPuzzle_idle1': 'LS: -1,MusicPuzzle_idle1.txt',
    'MusicPuzzle_idle2': 'LS: -1,MusicPuzzle_idle2.txt',
    'MusicPuzzle_idle3': 'LS: -1,MusicPuzzle_idle3.txt',
    'MusicPuzzle_idle4': 'LS: -1,MusicPuzzle_idle4.txt',
    'MusicPuzzle_idle5': 'LS: -1,MusicPuzzle_idle5.txt',
    'agent_sat_countdown': 'LS: -1,agent_sat_countdown.txt',
    'agent_sat_gameover': 'LS: -1,agent_sat_gameover.txt',
    'agent_sat_load_blue_blue': 'LS: -1,agent_sat_load_blue_blue.txt',
    'agent_sat_load_blue_green': 'LS: -1,agent_sat_load_blue_green.txt',
    'agent_sat_load_blue_pink': 'LS: -1,agent_sat_load_blue_pink.txt',
    'agent_sat_load_blue_red': 'LS: -1,agent_sat_load_blue_red.txt',
    'agent_sat_load_blue_turquis': 'LS: -1,agent_sat_load_blue_turquis.txt',
    'agent_sat_load_blue_yellow': 'LS: -1,agent_sat_load_blue_yellow.txt',
    'agent_sat_load_green_blue': 'LS: -1,agent_sat_load_green_blue.txt',
    'agent_sat_load_green_green': 'LS: -1,agent_sat_load_green_green.txt',
    'agent_sat_load_green_pink': 'LS: -1,agent_sat_load_green_pink.txt',
    'agent_sat_load_green_red': 'LS: -1,agent_sat_load_green_red.txt',
    'agent_sat_load_green_turquis': 'LS: -1,agent_sat_load_green_turquis.txt',
    'agent_sat_load_green_yellow': 'LS: -1,agent_sat_load_green_yellow.txt',
    'agent_sat_load_pink_blue': 'LS: -1,agent_sat_load_pink_blue.txt',
    'agent_sat_load_pink_green': 'LS: -1,agent_sat_load_pink_green.txt',
    'agent_sat_load_pink_pink': 'LS: -1,agent_sat_load_pink_pink.txt',
    'agent_sat_load_pink_red': 'LS: -1,agent_sat_load_pink_red.txt',
    'agent_sat_load_pink_turquis': 'LS: -1,agent_sat_load_pink_turquis.txt',
    'agent_sat_load_pink_yellow': 'LS: -1,agent_sat_load_pink_yellow.txt',
    'agent_sat_load_red_blue': 'LS: -1,agent_sat_load_red_blue.txt',
    'agent_sat_load_red_green': 'LS: -1,agent_sat_load_red_green.txt',
    'agent_sat_load_red_pink': 'LS: -1,agent_sat_load_red_pink.txt',
    'agent_sat_load_red_red': 'LS: -1,agent_sat_load_red_red.txt',
    'agent_sat_load_red_turquis': 'LS: -1,agent_sat_load_red_turquis.txt',
    'agent_sat_load_red_yellow': 'LS: -1,agent_sat_load_red_yellow.txt',
    'agent_sat_load_turquis_blue': 'LS: -1,agent_sat_load_turquis_blue.txt',
    'agent_sat_load_turquis_green': 'LS: -1,agent_sat_load_turquis_green.txt',
    'agent_sat_load_turquis_pink': 'LS: -1,agent_sat_load_turquis_pink.txt',
    'agent_sat_load_turquis_red': 'LS: -1,agent_sat_load_turquis_red.txt',
    'agent_sat_load_turquis_turquis': 'LS: -1,agent_sat_load_turquis_turquis.txt',
    'agent_sat_load_turquis_yellow': 'LS: -1,agent_sat_load_turquis_yellow.txt',
    'agent_sat_load_yellow_blue': 'LS: -1,agent_sat_load_yellow_blue.txt',
    'agent_sat_load_yellow_green': 'LS: -1,agent_sat_load_yellow_green.txt',
    'agent_sat_load_yellow_pink': 'LS: -1,agent_sat_load_yellow_pink.txt',
    'agent_sat_load_yellow_red': 'LS: -1,agent_sat_load_yellow_red.txt',
    'agent_sat_load_yellow_turquis': 'LS: -1,agent_sat_load_yellow_turquis.txt',
    'agent_sat_load_yellow_yellow': 'LS: -1,agent_sat_load_yellow_yellow.txt',
    'agent_sat_locket_blue_blue': 'LS: -1,agent_sat_locket_blue_blue.txt',
    'agent_sat_locket_blue_green': 'LS: -1,agent_sat_locket_blue_green.txt',
    'agent_sat_locket_blue_pink': 'LS: -1,agent_sat_locket_blue_pink.txt',
    'agent_sat_locket_blue_red': 'LS: -1,agent_sat_locket_blue_red.txt',
    'agent_sat_locket_blue_turquis': 'LS: -1,agent_sat_locket_blue_turquis.txt',
    'agent_sat_locket_blue_yellow': 'LS: -1,agent_sat_locket_blue_yellow.txt',
    'agent_sat_locket_green_blue': 'LS: -1,agent_sat_locket_green_blue.txt',
    'agent_sat_locket_green_green': 'LS: -1,agent_sat_locket_green_green.txt',
    'agent_sat_locket_green_pink': 'LS: -1,agent_sat_locket_green_pink.txt',
    'agent_sat_locket_green_red': 'LS: -1,agent_sat_locket_green_red.txt',
    'agent_sat_locket_green_turquis': 'LS: -1,agent_sat_locket_green_turquis.txt',
    'agent_sat_locket_green_yellow': 'LS: -1,agent_sat_locket_green_yellow.txt',
    'agent_sat_locket_pink_blue': 'LS: -1,agent_sat_locket_pink_blue.txt',
    'agent_sat_locket_pink_green': 'LS: -1,agent_sat_locket_pink_green.txt',
    'agent_sat_locket_pink_pink': 'LS: -1,agent_sat_locket_pink_pink.txt',
    'agent_sat_locket_pink_red': 'LS: -1,agent_sat_locket_pink_red.txt',
    'agent_sat_locket_pink_turquis': 'LS: -1,agent_sat_locket_pink_turquis.txt',
    'agent_sat_locket_pink_yellow': 'LS: -1,agent_sat_locket_pink_yellow.txt',
    'agent_sat_locket_red_blue': 'LS: -1,agent_sat_locket_red_blue.txt',
    'agent_sat_locket_red_green': 'LS: -1,agent_sat_locket_red_green.txt',
    'agent_sat_locket_red_pink': 'LS: -1,agent_sat_locket_red_pink.txt',
    'agent_sat_locket_red_red': 'LS: -1,agent_sat_locket_red_red.txt',
    'agent_sat_locket_red_turquis': 'LS: -1,agent_sat_locket_red_turquis.txt',
    'agent_sat_locket_red_yellow': 'LS: -1,agent_sat_locket_red_yellow.txt',
    'agent_sat_locket_turquis_blue': 'LS: -1,agent_sat_locket_turquis_blue.txt',
    'agent_sat_locket_turquis_green': 'LS: -1,agent_sat_locket_turquis_green.txt',
    'agent_sat_locket_turquis_pink': 'LS: -1,agent_sat_locket_turquis_pink.txt',
    'agent_sat_locket_turquis_red': 'LS: -1,agent_sat_locket_turquis_red.txt',
    'agent_sat_locket_turquis_turquis': 'LS: -1,agent_sat_locket_turquis_turquis.txt',
    'agent_sat_locket_turquis_yellow': 'LS: -1,agent_sat_locket_turquis_yellow.txt',
    'agent_sat_locket_yellow_blue': 'LS: -1,agent_sat_locket_yellow_blue.txt',
    'agent_sat_locket_yellow_green': 'LS: -1,agent_sat_locket_yellow_green.txt',
    'agent_sat_locket_yellow_pink': 'LS: -1,agent_sat_locket_yellow_pink.txt',
    'agent_sat_locket_yellow_red': 'LS: -1,agent_sat_locket_yellow_red.txt',
    'agent_sat_locket_yellow_turquis': 'LS: -1,agent_sat_locket_yellow_turquis.txt',
    'agent_sat_locket_yellow_yellow': 'LS: -1,agent_sat_locket_yellow_yellow.txt',
    'agent_sat_unlock_blue_blue': 'LS: -1,agent_sat_unlock_blue_blue.txt',
    'agent_sat_unlock_blue_green': 'LS: -1,agent_sat_unlock_blue_green.txt',
    'agent_sat_unlock_blue_pink': 'LS: -1,agent_sat_unlock_blue_pink.txt',
    'agent_sat_unlock_blue_red': 'LS: -1,agent_sat_unlock_blue_red.txt',
    'agent_sat_unlock_blue_turquis': 'LS: -1,agent_sat_unlock_blue_turquis.txt',
    'agent_sat_unlock_blue_yellow': 'LS: -1,agent_sat_unlock_blue_yellow.txt',
    'agent_sat_unlock_green_blue': 'LS: -1,agent_sat_unlock_green_blue.txt',
    'agent_sat_unlock_green_green': 'LS: -1,agent_sat_unlock_green_green.txt',
    'agent_sat_unlock_green_pink': 'LS: -1,agent_sat_unlock_green_pink.txt',
    'agent_sat_unlock_green_red': 'LS: -1,agent_sat_unlock_green_red.txt',
    'agent_sat_unlock_green_turquis': 'LS: -1,agent_sat_unlock_green_turquis.txt',
    'agent_sat_unlock_green_yellow': 'LS: -1,agent_sat_unlock_green_yellow.txt',
    'agent_sat_unlock_pink_blue': 'LS: -1,agent_sat_unlock_pink_blue.txt',
    'agent_sat_unlock_pink_green': 'LS: -1,agent_sat_unlock_pink_green.txt',
    'agent_sat_unlock_pink_pink': 'LS: -1,agent_sat_unlock_pink_pink.txt',
    'agent_sat_unlock_pink_red': 'LS: -1,agent_sat_unlock_pink_red.txt',
    'agent_sat_unlock_pink_turquis': 'LS: -1,agent_sat_unlock_pink_turquis.txt',
    'agent_sat_unlock_pink_yellow': 'LS: -1,agent_sat_unlock_pink_yellow.txt',
    'agent_sat_unlock_red_blue': 'LS: -1,agent_sat_unlock_red_blue.txt',
    'agent_sat_unlock_red_green': 'LS: -1,agent_sat_unlock_red_green.txt',
    'agent_sat_unlock_red_pink': 'LS: -1,agent_sat_unlock_red_pink.txt',
    'agent_sat_unlock_red_red': 'LS: -1,agent_sat_unlock_red_red.txt',
    'agent_sat_unlock_red_turquis': 'LS: -1,agent_sat_unlock_red_turquis.txt',
    'agent_sat_unlock_red_yellow': 'LS: -1,agent_sat_unlock_red_yellow.txt',
    'agent_sat_unlock_turquis_blue': 'LS: -1,agent_sat_unlock_turquis_blue.txt',
    'agent_sat_unlock_turquis_green': 'LS: -1,agent_sat_unlock_turquis_green.txt',
    'agent_sat_unlock_turquis_pink': 'LS: -1,agent_sat_unlock_turquis_pink.txt',
    'agent_sat_unlock_turquis_red': 'LS: -1,agent_sat_unlock_turquis_red.txt',
    'agent_sat_unlock_turquis_turquis': 'LS: -1,agent_sat_unlock_turquis_turquis.txt',
    'agent_sat_unlock_turquis_yellow': 'LS: -1,agent_sat_unlock_turquis_yellow.txt',
    'agent_sat_unlock_yellow_blue': 'LS: -1,agent_sat_unlock_yellow_blue.txt',
    'agent_sat_unlock_yellow_green': 'LS: -1,agent_sat_unlock_yellow_green.txt',
    'agent_sat_unlock_yellow_pink': 'LS: -1,agent_sat_unlock_yellow_pink.txt',
    'agent_sat_unlock_yellow_red': 'LS: -1,agent_sat_unlock_yellow_red.txt',
    'agent_sat_unlock_yellow_turquis': 'LS: -1,agent_sat_unlock_yellow_turquis.txt',
    'agent_sat_unlock_yellow_yellow': 'LS: -1,agent_sat_unlock_yellow_yellow.txt',
    'beepsMixed': 'LS: -1,beepsMixed.txt',
    'menu_choise1_to_choise2': 'LS: -1,menu_choise1_to_choise2.txt',
    'menu_choise1_to_selected1': 'LS: -1,menu_choise1_to_selected1.txt',
    'menu_choise2_to_choise3': 'LS: -1,menu_choise2_to_choise3.txt',
    'menu_choise2_to_selected2': 'LS: -1,menu_choise2_to_selected2.txt',
    'menu_choise3_to_choise4': 'LS: -1,menu_choise3_to_choise4.txt',
    'menu_choise3_to_selected3': 'LS: -1,menu_choise3_to_selected3.txt',
    'menu_choise4_to_choise1': 'LS: -1,menu_choise4_to_choise1.txt',
    'menu_choise4_to_selected4': 'LS: -1,menu_choise4_to_selected4.txt',
    'menu_game1_active': 'LS: -1,menu_game1_active.txt',
    'menu_game1_cancel': 'LS: -1,menu_game1_cancel.txt',
    'menu_game1_timeout': 'LS: -1,menu_game1_timeout.txt',
    'menu_game2_active': 'LS: -1,menu_game2_active.txt',
    'menu_game2_cancel': 'LS: -1,menu_game2_cancel.txt',
    'menu_game2_timeout': 'LS: -1,menu_game2_timeout.txt',
    'menu_game3_active': 'LS: -1,menu_game3_active.txt',
    'menu_game3_cancel': 'LS: -1,menu_game3_cancel.txt',
    'menu_game3_timeout': 'LS: -1,menu_game3_timeout.txt',
    'menu_game4_active': 'LS: -1,menu_game4_active.txt',
    'menu_game4_cancel': 'LS: -1,menu_game4_cancel.txt',
    'menu_game4_timeout': 'LS: -1,menu_game4_timeout.txt',
    'menu_idle': 'LS: -1,menu_idle.txt',
    'menu_idle_to_choise1': 'LS: -1,menu_idle_to_choise1.txt',
    'mix_ReadySetGo1': 'LS: -1,mix_ReadySetGo1.txt'
});

const _soundsByName = {};

const _sounds = Object.freeze({
    'Silence': 'AS: STOP',
    'MusicPuzzle01_arp': 'AS: 1,MusicPuzzle01_arp.wav',
    'MusicPuzzle01_bassline': 'AS: 1,MusicPuzzle01_bassline.wav',
    'MusicPuzzle01_drums': 'AS: 1,MusicPuzzle01_drums.wav',
    'MusicPuzzle01_fx': 'AS: 1,MusicPuzzle01_fx.wav',
    'MusicPuzzle01_fx_808': 'AS: 1,MusicPuzzle01_fx_808.wav',
    'MusicPuzzle01_loop': 'AS: 1,MusicPuzzle01_loop.wav',
    'MusicPuzzle02_808': 'AS: 1,MusicPuzzle02_808.wav',
    'MusicPuzzle02_bigHorns': 'AS: 1,MusicPuzzle02_bigHorns.wav',
    'MusicPuzzle02_drums': 'AS: 1,MusicPuzzle02_drums.wav',
    'MusicPuzzle02_fx_vox': 'AS: 1,MusicPuzzle02_fx_vox.wav',
    'MusicPuzzle02_synths': 'AS: 1,MusicPuzzle02_synths.wav',
    'MusicPuzzle03_bass': 'AS: 1,MusicPuzzle03_bass.wav',
    'MusicPuzzle03_drums': 'AS: 1,MusicPuzzle03_drums.wav',
    'MusicPuzzle03_fx_Vox': 'AS: 1,MusicPuzzle03_fx_Vox.wav',
    'MusicPuzzle03_keys': 'AS: 1,MusicPuzzle03_keys.wav',
    'MusicPuzzle03_melody': 'AS: 1,MusicPuzzle03_melody.wav',
    'MusicPuzzle04_bass': 'AS: 1,MusicPuzzle04_bass.wav',
    'MusicPuzzle04_drums': 'AS: 1,MusicPuzzle04_drums.wav',
    'MusicPuzzle04_fx_Vox': 'AS: 1,MusicPuzzle04_fx_Vox.wav',
    'MusicPuzzle04_keys': 'AS: 1,MusicPuzzle04_keys.wav',
    'MusicPuzzle04_pianos': 'AS: 1,MusicPuzzle04_pianos.wav',
    'MusicPuzzle05_bass': 'AS: 1,MusicPuzzle05_bass.wav',
    'MusicPuzzle05_drums': 'AS: 1,MusicPuzzle05_drums.wav',
    'MusicPuzzle05_fx_Vox': 'AS: 1,MusicPuzzle05_fx_Vox.wav',
    'MusicPuzzle05_lead': 'AS: 1,MusicPuzzle05_lead.wav',
    'MusicPuzzle05_pluck': 'AS: 1,MusicPuzzle05_pluck.wav',
    'agent_BigStagers_EC09_13_4': 'AS: 1,agent_BigStagers_EC09_13_4.wav',
    'agent_BonusScore': 'AS: 1,agent_BonusScore.wav',
    'agent_Bonus_time': 'AS: 1,agent_Bonus_time.wav',
    'agent_Choose_game': 'AS: 1,agent_Choose_game.wav',
    'agent_Countdown_Beep_2': 'AS: 1,agent_Countdown_Beep_2.wav',
    'agent_Countdown_Beep_3': 'AS: 1,agent_Countdown_Beep_3.wav',
    'agent_MainTrack0': 'AS: 1,agent_MainTrack0.wav',
    'agent_MainTrack1': 'AS: 1,agent_MainTrack1.wav',
    'agent_MainTrack46sec': 'AS: 1,agent_MainTrack46sec.wav',
    'agent_TalkAnd': 'AS: 1,agent_TalkAnd.wav',
    'agent_TalkBlue': 'AS: 1,agent_TalkBlue.wav',
    'agent_TalkCode': 'AS: 1,agent_TalkCode.wav',
    'agent_TalkContinue': 'AS: 1,agent_TalkContinue.wav',
    'agent_TalkEndBeep1': 'AS: 1,agent_TalkEndBeep1.wav',
    'agent_TalkEndBeep2': 'AS: 1,agent_TalkEndBeep2.wav',
    'agent_TalkExtraLife': 'AS: 1,agent_TalkExtraLife.wav',
    'agent_TalkExtraTime': 'AS: 1,agent_TalkExtraTime.wav',
    'agent_TalkFindAllThe': 'AS: 1,agent_TalkFindAllThe.wav',
    'agent_TalkGreen': 'AS: 1,agent_TalkGreen.wav',
    'agent_TalkLevel': 'AS: 1,agent_TalkLevel.wav',
    'agent_TalkLevelAutoComplet': 'AS: 1,agent_TalkLevelAutoComplet.wav',
    'agent_TalkOneMore': 'AS: 1,agent_TalkOneMore.wav',
    'agent_TalkPink': 'AS: 1,agent_TalkPink.wav',
    'agent_TalkPurble': 'AS: 1,agent_TalkPurble.wav',
    'agent_TalkRed': 'AS: 1,agent_TalkRed.wav',
    'agent_TalkStartSound1': 'AS: 1,agent_TalkStartSound1.wav',
    'agent_TalkStartSound2': 'AS: 1,agent_TalkStartSound2.wav',
    'agent_TalkStartSound3': 'AS: 1,agent_TalkStartSound3.wav',
    'agent_TalkTheNextCode': 'AS: 1,agent_TalkTheNextCode.wav',
    'agent_TalkTimeTravel': 'AS: 1,agent_TalkTimeTravel.wav',
    'agent_TalkTurkish': 'AS: 1,agent_TalkTurkish.wav',
    'agent_TalkYellow': 'AS: 1,agent_TalkYellow.wav',
    'agent_TalkYouMade': 'AS: 1,agent_TalkYouMade.wav',
    'agent_agentgameTheme': 'AS: 1,agent_agentgameTheme.wav',
    'agent_beep1': 'AS: 1,agent_beep1.wav',
    'agent_beep2': 'AS: 1,agent_beep2.wav',
    'agent_beep3': 'AS: 1,agent_beep3.wav',
    'agent_beep4': 'AS: 1,agent_beep4.wav',
    'agent_beep5': 'AS: 1,agent_beep5.wav',
    'agent_beep6': 'AS: 1,agent_beep6.wav',
    'agent_beep7': 'AS: 1,agent_beep7.wav',
    'agent_beep8': 'AS: 1,agent_beep8.wav',
    'agent_bonusSound': 'AS: 1,agent_bonusSound.wav',
    'agent_loopRewind': 'AS: 1,agent_loopRewind.wav',
    'agent_loop_1': 'AS: 1,agent_loop_1.wav',
    'agent_loop_2': 'AS: 1,agent_loop_2.wav',
    'agent_loop_3': 'AS: 1,agent_loop_3.wav',
    'agent_loop_4': 'AS: 1,agent_loop_4.wav',
    'agent_loop_5': 'AS: 1,agent_loop_5.wav',
    'agent_magic_explosion_4': 'AS: 1,agent_magic_explosion_4.wav',
    'agent_num_01': 'AS: 1,agent_num_01.wav',
    'agent_num_02': 'AS: 1,agent_num_02.wav',
    'agent_num_03': 'AS: 1,agent_num_03.wav',
    'agent_num_04': 'AS: 1,agent_num_04.wav',
    'agent_num_05': 'AS: 1,agent_num_05.wav',
    'agent_num_06': 'AS: 1,agent_num_06.wav',
    'agent_num_07': 'AS: 1,agent_num_07.wav',
    'agent_num_08': 'AS: 1,agent_num_08.wav',
    'agent_num_09': 'AS: 1,agent_num_09.wav',
    'agent_num_10': 'AS: 1,agent_num_10.wav',
    'agent_num_100': 'AS: 1,agent_num_100.wav',
    'agent_num_11': 'AS: 1,agent_num_11.wav',
    'agent_num_12': 'AS: 1,agent_num_12.wav',
    'agent_num_13': 'AS: 1,agent_num_13.wav',
    'agent_num_14': 'AS: 1,agent_num_14.wav',
    'agent_num_15': 'AS: 1,agent_num_15.wav',
    'agent_num_16': 'AS: 1,agent_num_16.wav',
    'agent_num_17': 'AS: 1,agent_num_17.wav',
    'agent_num_18': 'AS: 1,agent_num_18.wav',
    'agent_num_19': 'AS: 1,agent_num_19.wav',
    'agent_num_20': 'AS: 1,agent_num_20.wav',
    'agent_num_30': 'AS: 1,agent_num_30.wav',
    'agent_num_40': 'AS: 1,agent_num_40.wav',
    'agent_num_50': 'AS: 1,agent_num_50.wav',
    'agent_num_60': 'AS: 1,agent_num_60.wav',
    'agent_num_70': 'AS: 1,agent_num_70.wav',
    'agent_num_80': 'AS: 1,agent_num_80.wav',
    'agent_num_90': 'AS: 1,agent_num_90.wav',
    'agent_num_NewHighScore': 'AS: 1,agent_num_NewHighScore.wav',
    'agent_num_TalkAmazing': 'AS: 1,agent_num_TalkAmazing.wav',
    'agent_num_TalkCanDoBetter': 'AS: 1,agent_num_TalkCanDoBetter.wav',
    'agent_num_TalkGreateJob': 'AS: 1,agent_num_TalkGreateJob.wav',
    'agent_num_TalkLevel': 'AS: 1,agent_num_TalkLevel.wav',
    'agent_num_TalkWellDone': 'AS: 1,agent_num_TalkWellDone.wav',
    'agent_num_TalkYouMade': 'AS: 1,agent_num_TalkYouMade.wav',
    'agent_releashSound': 'AS: 1,agent_releashSound.wav',
    'agent_spawn01': 'AS: 1,agent_spawn01.wav',
    'agent_talkEmpty': 'AS: 1,agent_talkEmpty.wav',
    'agent_talk_Intro': 'AS: 1,agent_talk_Intro.wav',
    'agent_talk_missionFailed': 'AS: 1,agent_talk_missionFailed.wav',
    'agent_timetravel': 'AS: 1,agent_timetravel.wav',
    'agent_warp': 'AS: 1,agent_warp.wav',
    'beepsMixed': 'AS: 1,beepsMixed.wav',
    'factory': 'AS: 1,factory.wav',
    'mix_431hz500msBeep': 'AS: 1,mix_431hz500msBeep.wav',
    'mix_722hz500msBeep': 'AS: 1,mix_722hz500msBeep.wav',
    'mix_Active1': 'AS: 1,mix_Active1.wav',
    'mix_Applause': 'AS: 1,mix_Applause.wav',
    'mix_Bassdrum': 'AS: 1,mix_Bassdrum.wav',
    'mix_Bell': 'AS: 1,mix_Bell.wav',
    'mix_Bernhard': 'AS: 1,mix_Bernhard.wav',
    'mix_BombExplosion': 'AS: 1,mix_BombExplosion.wav',
    'mix_BombTak': 'AS: 1,mix_BombTak.wav',
    'mix_BombTik': 'AS: 1,mix_BombTik.wav',
    'mix_CYCdh_ClHat': 'AS: 1,mix_CYCdh_ClHat.wav',
    'mix_CYCdh_Tom': 'AS: 1,mix_CYCdh_Tom.wav',
    'mix_Catch4': 'AS: 1,mix_Catch4.wav',
    'mix_Chicken2': 'AS: 1,mix_Chicken2.wav',
    'mix_Closehihat': 'AS: 1,mix_Closehihat.wav',
    'mix_Closehihat_HipHop': 'AS: 1,mix_Closehihat_HipHop.wav',
    'mix_Cow2': 'AS: 1,mix_Cow2.wav',
    'mix_Cowbell': 'AS: 1,mix_Cowbell.wav',
    'mix_Crash': 'AS: 1,mix_Crash.wav',
    'mix_DiamondActive': 'AS: 1,mix_DiamondActive.wav',
    'mix_DonkeyIAAA': 'AS: 1,mix_DonkeyIAAA.wav',
    'mix_Drumroll': 'AS: 1,mix_Drumroll.wav',
    'mix_ExplosionMissionFailed': 'AS: 1,mix_ExplosionMissionFailed.wav',
    'mix_GameCompleted': 'AS: 1,mix_GameCompleted.wav',
    'mix_GoatBah': 'AS: 1,mix_GoatBah.wav',
    'mix_Horse1': 'AS: 1,mix_Horse1.wav',
    'mix_Loop2': 'AS: 1,mix_Loop2.wav',
    'mix_Openhihat': 'AS: 1,mix_Openhihat.wav',
    'mix_Pig1': 'AS: 1,mix_Pig1.wav',
    'mix_Plip': 'AS: 1,mix_Plip.wav',
    'mix_Poison5': 'AS: 1,mix_Poison5.wav',
    'mix_Pop': 'AS: 1,mix_Pop.wav',
    'mix_ReadySetGo1': 'AS: 1,mix_ReadySetGo1.wav',
    'mix_Snare': 'AS: 1,mix_Snare.wav',
    'mix_SpeakSetVolume': 'AS: 1,mix_SpeakSetVolume.wav',
    'mix_Touch': 'AS: 1,mix_Touch.wav',
    'mix_Warp': 'AS: 1,mix_Warp.wav',
    'mix_WhistleMatchEnd': 'AS: 1,mix_WhistleMatchEnd.wav',
    'mix_WhistleMatchStart': 'AS: 1,mix_WhistleMatchStart.wav',
    'mix_Yahoo': 'AS: 1,mix_Yahoo.wav',
    'mix_bird2': 'AS: 1,mix_bird2.wav',
    'mix_laugh': 'AS: 1,mix_laugh.wav',
    'mix_sheep': 'AS: 1,mix_sheep.wav',
    'scratch_Animal': 'AS: 1,scratch_Animal.wav',
    'scratch_Bell_1': 'AS: 1,scratch_Bell_1.wav',
    'scratch_Bell_2': 'AS: 1,scratch_Bell_2.wav',
    'scratch_Bike_horn': 'AS: 1,scratch_Bike_horn.wav',
    'scratch_Bird_1': 'AS: 1,scratch_Bird_1.wav',
    'scratch_Bird_2': 'AS: 1,scratch_Bird_2.wav',
    'scratch_Bird_3': 'AS: 1,scratch_Bird_3.wav',
    'scratch_Bird_4': 'AS: 1,scratch_Bird_4.wav',
    'scratch_Bowling': 'AS: 1,scratch_Bowling.wav',
    'scratch_Car_breaking': 'AS: 1,scratch_Car_breaking.wav',
    'scratch_Car_driving_by': 'AS: 1,scratch_Car_driving_by.wav',
    'scratch_Car_horn_1': 'AS: 1,scratch_Car_horn_1.wav',
    'scratch_Car_horn_2': 'AS: 1,scratch_Car_horn_2.wav',
    'scratch_Cartoon_laughing': 'AS: 1,scratch_Cartoon_laughing.wav',
    'scratch_Cow': 'AS: 1,scratch_Cow.wav',
    'scratch_Cricket': 'AS: 1,scratch_Cricket.wav',
    'scratch_Crowd_cheering_1': 'AS: 1,scratch_Crowd_cheering_1.wav',
    'scratch_Crowd_cheering_2': 'AS: 1,scratch_Crowd_cheering_2.wav',
    'scratch_Crowd_laughing': 'AS: 1,scratch_Crowd_laughing.wav',
    'scratch_Door_Bell': 'AS: 1,scratch_Door_Bell.wav',
    'scratch_Door_creaking': 'AS: 1,scratch_Door_creaking.wav',
    'scratch_Engine_running': 'AS: 1,scratch_Engine_running.wav',
    'scratch_Engine_starting': 'AS: 1,scratch_Engine_starting.wav',
    'scratch_Frog': 'AS: 1,scratch_Frog.wav',
    'scratch_Glass_breaking': 'AS: 1,scratch_Glass_breaking.wav',
    'scratch_Heavy_rain': 'AS: 1,scratch_Heavy_rain.wav',
    'scratch_Horse_1': 'AS: 1,scratch_Horse_1.wav',
    'scratch_Horse_2': 'AS: 1,scratch_Horse_2.wav',
    'scratch_Horse_riding': 'AS: 1,scratch_Horse_riding.wav',
    'scratch_Jungle_birds_and_crickets_1': 'AS: 1,scratch_Jungle_birds_and_crickets_1.wav',
    'scratch_Jungle_birds_and_crickets_2': 'AS: 1,scratch_Jungle_birds_and_crickets_2.wav',
    'scratch_Mechanical_1': 'AS: 1,scratch_Mechanical_1.wav',
    'scratch_Mechanical_2': 'AS: 1,scratch_Mechanical_2.wav',
    'scratch_Mechanical_winding_up': 'AS: 1,scratch_Mechanical_winding_up.wav',
    'scratch_Phone_ringing_1': 'AS: 1,scratch_Phone_ringing_1.wav',
    'scratch_Phone_ringing_2': 'AS: 1,scratch_Phone_ringing_2.wav',
    'scratch_SFX_1': 'AS: 1,scratch_SFX_1.wav',
    'scratch_SFX_10': 'AS: 1,scratch_SFX_10.wav',
    'scratch_SFX_11': 'AS: 1,scratch_SFX_11.wav',
    'scratch_SFX_12': 'AS: 1,scratch_SFX_12.wav',
    'scratch_SFX_13': 'AS: 1,scratch_SFX_13.wav',
    'scratch_SFX_14': 'AS: 1,scratch_SFX_14.wav',
    'scratch_SFX_15': 'AS: 1,scratch_SFX_15.wav',
    'scratch_SFX_16': 'AS: 1,scratch_SFX_16.wav',
    'scratch_SFX_17': 'AS: 1,scratch_SFX_17.wav',
    'scratch_SFX_18': 'AS: 1,scratch_SFX_18.wav',
    'scratch_SFX_19': 'AS: 1,scratch_SFX_19.wav',
    'scratch_SFX_20': 'AS: 1,scratch_SFX_20.wav',
    'scratch_SFX_21': 'AS: 1,scratch_SFX_21.wav',
    'scratch_SFX_22': 'AS: 1,scratch_SFX_22.wav',
    'scratch_SFX_23': 'AS: 1,scratch_SFX_23.wav',
    'scratch_SFX_24': 'AS: 1,scratch_SFX_24.wav',
    'scratch_SFX_25': 'AS: 1,scratch_SFX_25.wav',
    'scratch_SFX_26': 'AS: 1,scratch_SFX_26.wav',
    'scratch_SFX_27': 'AS: 1,scratch_SFX_27.wav',
    'scratch_SFX_28': 'AS: 1,scratch_SFX_28.wav',
    'scratch_SFX_29_-_game_over_1': 'AS: 1,scratch_SFX_29_-_game_over_1.wav',
    'scratch_SFX_2_-_ding_dingeling': 'AS: 1,scratch_SFX_2_-_ding_dingeling.wav',
    'scratch_SFX_30_-_next_level': 'AS: 1,scratch_SFX_30_-_next_level.wav',
    'scratch_SFX_31': 'AS: 1,scratch_SFX_31.wav',
    'scratch_SFX_32_-_game_over_2': 'AS: 1,scratch_SFX_32_-_game_over_2.wav',
    'scratch_SFX_33_-_game_over_3': 'AS: 1,scratch_SFX_33_-_game_over_3.wav',
    'scratch_SFX_34': 'AS: 1,scratch_SFX_34.wav',
    'scratch_SFX_35': 'AS: 1,scratch_SFX_35.wav',
    'scratch_SFX_36': 'AS: 1,scratch_SFX_36.wav',
    'scratch_SFX_37': 'AS: 1,scratch_SFX_37.wav',
    'scratch_SFX_38': 'AS: 1,scratch_SFX_38.wav',
    'scratch_SFX_39': 'AS: 1,scratch_SFX_39.wav',
    'scratch_SFX_3_-_ding_dingeling': 'AS: 1,scratch_SFX_3_-_ding_dingeling.wav',
    'scratch_SFX_4': 'AS: 1,scratch_SFX_4.wav',
    'scratch_SFX_40_-_rubber_duck': 'AS: 1,scratch_SFX_40_-_rubber_duck.wav',
    'scratch_SFX_41': 'AS: 1,scratch_SFX_41.wav',
    'scratch_SFX_42_-_drums': 'AS: 1,scratch_SFX_42_-_drums.wav',
    'scratch_SFX_43': 'AS: 1,scratch_SFX_43.wav',
    'scratch_SFX_44': 'AS: 1,scratch_SFX_44.wav',
    'scratch_SFX_45': 'AS: 1,scratch_SFX_45.wav',
    'scratch_SFX_46': 'AS: 1,scratch_SFX_46.wav',
    'scratch_SFX_47': 'AS: 1,scratch_SFX_47.wav',
    'scratch_SFX_5': 'AS: 1,scratch_SFX_5.wav',
    'scratch_SFX_6': 'AS: 1,scratch_SFX_6.wav',
    'scratch_SFX_7': 'AS: 1,scratch_SFX_7.wav',
    'scratch_SFX_8': 'AS: 1,scratch_SFX_8.wav',
    'scratch_SFX_9': 'AS: 1,scratch_SFX_9.wav',
    'scratch_Sheep': 'AS: 1,scratch_Sheep.wav',
    'scratch_Snaredrum': 'AS: 1,scratch_Snaredrum.wav',
    'scratch_Snooring_cartoon': 'AS: 1,scratch_Snooring_cartoon.wav',
    'scratch_Spring_1': 'AS: 1,scratch_Spring_1.wav',
    'scratch_Spring_2': 'AS: 1,scratch_Spring_2.wav',
    'scratch_Spring_3': 'AS: 1,scratch_Spring_3.wav',
    'scratch_Spring_4': 'AS: 1,scratch_Spring_4.wav',
    'scratch_Spring_5': 'AS: 1,scratch_Spring_5.wav',
    'scratch_Spring_6': 'AS: 1,scratch_Spring_6.wav',
    'scratch_Spring_7': 'AS: 1,scratch_Spring_7.wav',
    'scratch_Spring_8': 'AS: 1,scratch_Spring_8.wav',
    'scratch_Thunder': 'AS: 1,scratch_Thunder.wav',
    'scratch_Traffic_noise': 'AS: 1,scratch_Traffic_noise.wav',
    'scratch_Train_horn': 'AS: 1,scratch_Train_horn.wav',
    'scratch_Tuning_instruments_1': 'AS: 1,scratch_Tuning_instruments_1.wav',
    'scratch_Tuning_instruments_2': 'AS: 1,scratch_Tuning_instruments_2.wav',
    'scratch_Water_drop': 'AS: 1,scratch_Water_drop.wav',
    'scratch_Water_splash': 'AS: 1,scratch_Water_splash.wav',
    'scratch_Wave_at_sea': 'AS: 1,scratch_Wave_at_sea.wav',
    'scratch_Whistle': 'AS: 1,scratch_Whistle.wav',
    'scratch_iPhone_ringing': 'AS: 1,scratch_iPhone_ringing.wav'
});

const NOT_FOUND = ' ';

/**
 * Manage communication with a Playspot peripheral over a MQTT client socket.
 */
class Playspot {
    /**
     * Construct a Playspot communication object.
     * @param {Runtime} runtime - the Scratch 3.0 runtime
     * @param {string} extensionId - the id of the extension
     */
    constructor (runtime, extensionId) {
        this.broker = `ws://${window.location.hostname}:3000`;
        this._connected = false;
        this._config = null;

        /**
         * The Scratch 3.0 runtime
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;
        this._runtime.registerPeripheralExtension(extensionId, this);

        /**
         * The id of the extension this peripheral belongs to.
         */
        this._extensionId = extensionId;

        /**
         * The most recently received value for each sensor.
         * @type {Object.<string, number>}
         * @private
         */
        this._satellites = {};

        // Satellite event handlers
        this._satelliteStatusHandler = sender => {
            log.info(`satelliteStatusHandler fired for sender: ${sender}`);
            this._satellites[sender] = {
                isTouched: false,
                hasPresence: false
            };
            const stage = this._runtime.getTargetForStage();
            let allSats = stage.lookupVariableByNameAndType('All_Satellites', Variable.LIST_TYPE);
            if (!allSats) {
                allSats = this._runtime.createNewGlobalVariable('All_Satellites', false, Variable.LIST_TYPE);
            }
            stage.variables[allSats.id].value = Object.keys(this._satellites);
            this.setRadarConfiguration({
                SATELLITE: sender,
                FSPEED: ['2'],
                BSPEED: ['2'],
                FMAG: ['5'],
                BMAG: ['5'],
                DET: ['1']
            });
            this._runtime.emit(this._runtime.constructor.PERIPHERAL_LIST_UPDATE, this._satellites);
        };

        this._firmwareHandler = payload => {
            log.info(`firmware handler fired`);
            const json = JSON.parse(payload);
            const files = json.files;
            const names = files.map(currentValue => (currentValue.filename));
            const wavs = names.filter(currentValue => (currentValue.includes('.wav')));
            const soundsByName = {};
            wavs.forEach(currentValue => {
                const val = currentValue.replace('.wav', '');
                soundsByName[val] = `AS: 1,${currentValue}`;
            });
            this._soundsByName = Object.freeze(soundsByName);

            const sounds = wavs.map(currentValue => {
                const val = currentValue.replace('.wav', '');
                const newObj = {};
                newObj[val] = `AS: 1,${currentValue}`;
                return newObj;
            });
            this._sounds = Object.freeze([{Silence: 'AS: STOP'}] + sounds);

            // Setup the AllSounds variable
            const stage = this._runtime.getTargetForStage();
            let allSounds = stage.lookupVariableByNameAndType('All_Sounds', Variable.LIST_TYPE);
            if (!allSounds) {
                allSounds = this._runtime.createNewGlobalVariable('All_Sounds', false, Variable.LIST_TYPE);
            }
            stage.variables[allSounds.id].value = wavs.map(currentValue => currentValue.replace('.wav', ''));
            this._runtime.emit(this._runtime.constructor.PERIPHERAL_LIST_UPDATE, this._sounds);
        };

        this._presenceHandler = (sender, payload) => {
            // log.info(`presenceHandler fired for payload: ${payload}`);
            this._satellites[sender].hasPresence = payload[0] === 0x31;
        };

        this._touchHandler = (sender, payload) => {
            log.info(`touchHandler fired for payload: ${payload}`);
            this._satellites[sender].isTouched = payload[0] === 0x31;
        };

        this._onMessage = (topic, payload) => {
            log.info(`onMessage fired for topic: ${topic}, payload: ${payload}`);
            const t = topic.split('/');
            if (topic === null || t.count < 2) return;
            if (t[0] === 'fwserver' && t[1] === 'files') {
                this._firmwareHandler(payload);
            } else if (t.count < 4) {
                return;
            } else if (t[0] === 'sat' && t[2] === 'online') {
                this._satelliteStatusHandler(t[1]); // this is a status message
            } else if (t[0] === 'sat' && t[2] === 'ev' && t[3] === 'touch') {
                this._touchHandler(t[1], payload); // this is a touch message
            } else if (t[0] === 'sat' && t[2] === 'ev' && t[3] === 'radar') {
                this._presenceHandler(t[1], payload); // this is a presence message
            }
        };

        this._onStatusTimer = () => {
            log.info('status timeout timer fired');
            clearTimeout(this._fetchSatellitesTimeout);
            this._fetchSatellitesTimeout = null;

            // Not interested in status messages now
            if (this._client) {
                this._client.unsubscribe('sat/+/online');
                // subscribe to radar and touch
                this._client.subscribe('sat/+/ev/radar');
                this._client.subscribe('sat/+/ev/touch');
            }

            // The VM to refreshBlocks
            this._runtime.emit(this._runtime.constructor.PERIPHERAL_CONNECTED);
            this._connected = true;
        };

        this._onConnectTimer = () => {
            if (!this._connected) {
                log.info('connection timeout timer fired');
                this._onError();
            }
        };

        this._onConnect = () => {
            log.info(`onConnect fired`);

            // subscribe to all status, radar detection and touch events
            if (this._client) {
                this._client.subscribe('sat/+/online');
                this._client.subscribe('fwserver/online');
                this._client.subscribe('fwserver/files');
            }

            // Give everyone 5 seconds to report again
            this._fetchSatellitesTimeout = setTimeout(this._onStatusTimer, 5000);
        };

        this._onReconnect = () => {
            log.info(`onReconnect fired`);
        };

        this._onClose = () => {
            log.info(`onClose fired`);
            this._connected = false;
            this.closeConnection();
        };

        this._onError = error => {
            log.info(`onError fired with: ${error}`);
            if (this._client) {
                this._client.end();
                this._client = null;
            }
            this.closeConnection();
            this.performConnection();
        };

        this._onConnect = this._onConnect.bind(this);
        this._onReconnect = this._onReconnect.bind(this);
        this._onMessage = this._onMessage.bind(this);
        this._onClose = this._onClose.bind(this);
        this._onError = this._onError.bind(this);
        this._onStatusTimer = this._onStatusTimer.bind(this);
        this._onConnectTimer = this._onConnectTimer.bind(this);
    }

    closeConnection () {
        this._connected = false;
        if (this._client === null) return;
        this._client.end(true, () => {
            this._client.removeListener('connect', this._onConnect);
            this._client.removeListener('reconnect', this._onReconnect);
            this._client.removeListener('message', this._onMessage);
            this._client.removeListener('close', this._onClose);
            this._client.removeListener('error', this._onError);
            this._client = null;
        });
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
    }

    performConnection () {
        if (this._client) {
            log.info(`performConnection fired but already connected`);
            return;
        }
        log.info(`performConnection fired`);
        this._client = mqtt.connect(this.broker);
        if (!this._client) this._onError();

        // bind the event handlers
        this._client.on('connect', this._onConnect);
        this._client.on('reconnect', this._onReconnect);
        this._client.on('message', this._onMessage);
        this._client.on('close', this._onClose);
        this._client.on('error', this._onError);
        this._onStatusTimer = this._onStatusTimer.bind(this);
        this._onConnectTimer = this._onConnectTimer.bind(this);

        this._performConnectTimeout = setTimeout(this._onConnectTimer, 4000);
    }

    /**
     * Called by the runtime when user wants to scan for a peripheral.
     */
    scan () {
        log.info(`scan fired`);
        this.connect();
    }

    /**
     * Called by the runtime when user wants to connect to a certain peripheral.
     * @param {string} host - the host FQDN or IP Addr to connect to.
     */
    connect (host) {
        log.info(`connected fired with url = ${host}`);
        if (host) this.broker = `ws://${host}:3000`;
        if (!this.broker) {
            this._onError();
            return;
        }
        log.info(`will connect with = ${this.broker}`);
        if (this._client) {
            // connect to the possibly new broker
            this._client.end(false, this.performConnection.bind(this));
        } else {
            const url = `http://${window.location.hostname}/config/${host}.json`;
            http.get(url, resp => {
                const statusCode = resp.statusCode;
                const contentType = resp.headers['content-type'];

                let error;
                if (statusCode !== 200) {
                    error = new Error(`Request Failed.\nStatus Code: ${statusCode}`);
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error('Invalid content-type.\n' +
                                    `Expected application/json but received ${contentType}`);
                }
                if (error) {
                    // log.info(`Error: ${error.message}`);
                    // Consume response data to free up memory
                    resp.resume();
                    this.performConnection();
                    return;
                }
                let data = '';
                resp.on('data', chunk => {
                    data += chunk;
                });
                resp.on('end', () => {
                    this._config = JSON.parse(data);
                    this.performConnection();
                });
            }).on('error', err => {
                log.info(`Error: ${err.message}`);
                this.performConnection();
            });
        }
    }

    /**
     * Called by the runtime when user wants to connect to a certain peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */
    disconnect () {
        log.info(`disconnecting`);
        if (this._client) {
            this._client.end(false, this.removeConnection.bind(this));
        }
    }

    /**
     * Return true if connected to the micro:bit.
     * @return {boolean} - whether the micro:bit is connected.
     */
    isConnected () {
        return this._client && this._connected;
    }

    /**
     */
    refreshSatellites () {
        this._client.unsubscribe('sat/+/online');
        this._client.subscribe('sat/+/online');
    }

    setRadarConfiguration (args) {
        const utf8Encode = new TextEncoder();
        const options = {qos: 2};

        const fSpeedTopic = `sat/${args.SATELLITE}/cfg/radar/fSpeed`;
        this._client.publish(fSpeedTopic, utf8Encode.encode(args.FSPEED), options);

        const bSpeedTopic = `sat/${args.SATELLITE}/cfg/radar/bSpeed`;
        this._client.publish(bSpeedTopic, utf8Encode.encode(args.BSPEED), options);

        const fMagTopic = `sat/${args.SATELLITE}/cfg/radar/fMag`;
        this._client.publish(fMagTopic, utf8Encode.encode(args.FMAG), options);

        const bMagTopic = `sat/${args.SATELLITE}/cfg/radar/bMag`;
        this._client.publish(bMagTopic, utf8Encode.encode(args.BMAG), options);

        const detEnTopic = `sat/${args.SATELLITE}/cfg/radar/detEn`;
        this._client.publish(detEnTopic, utf8Encode.encode(args.DET), options);
    }

    /**
     * @param {object} args - the satellite to display on and the sequence to display
     * @return {Promise} - a Promise that resolves when writing to peripheral.
     */
    displayLightSequence (args) {
        const outboundTopic = `sat/${args.SATELLITE}/cmd/fx`;
        const string = [_sequences[args.SEQUENCE]];
        const utf8Encode = new TextEncoder();
        const arr = utf8Encode.encode(string);
        this._client.publish(outboundTopic, arr);
        return Promise.resolve();
    }

    /**
     * @param {object} args - the satellite to display on and the sound play
     * @return {Promise} - a Promise that resolves when writing to peripheral.
     */
    playSound (args) {
        const outboundTopic = `sat/${args.SATELLITE}/cmd/fx`;
        const string = [this._sounds[args.SOUND]];
        const utf8Encode = new TextEncoder();
        const arr = utf8Encode.encode(string);
        this._client.publish(outboundTopic, arr);
        return Promise.resolve();
    }

    /**
     * @param {object} args - the satellite to display on and the sound play
     * @return {Promise} - a Promise that resolves when writing to peripheral.
     */
    playSoundByName (args) {
        const outboundTopic = `sat/${args.SATELLITE}/cmd/fx`;
        const string = [this._soundsByName[args.SOUNDNAME]];
        const utf8Encode = new TextEncoder();
        const arr = utf8Encode.encode(string);
        this._client.publish(outboundTopic, arr);
        return Promise.resolve();
    }
    /**
     * @param {object} args - the image to display
     * @return {Promise} - a Promise that resolves when writing to peripheral.
     */
    displayImage (args) {
        const outboundTopic = `display`;
        const string = `{ "image": "${_images[args.IMAGE]}" }`;
        const utf8Encode = new TextEncoder();
        const arr = utf8Encode.encode(string);
        this._client.publish(outboundTopic, arr);
        return Promise.resolve();
    }

    /**
     * @param {object} args - the image to display
     * @return {Promise} - a Promise that resolves when writing to peripheral.
     */
    displayHistogram (args) {
        let colorString = '';
        if (args.COLOR) {
            colorString = '"color" : { "red": args.COLOR[red], "green": args.COLOR[green], "blue": args.COLOR[blue] }';
        }
        const outboundTopic = `display`;
        const string = `{ "histogram": { ${colorString} } }`;
        const utf8Encode = new TextEncoder();
        const arr = utf8Encode.encode(string);
        this._client.publish(outboundTopic, arr);
        return Promise.resolve();
    }

    /**
     * @param {object} args - the satellite to display on and the volume to use
     * @return {Promise} - a Promise that resolves when writing to peripheral.
     */
    setVolume (args) {
        const outboundTopic = `sat/${args.SATELLITE}/cmd/fx`;
        const string = `AS: vol ${[_volumes[args.VOLUME]]}`;
        const utf8Encode = new TextEncoder();
        const arr = utf8Encode.encode(string);
        this._client.publish(outboundTopic, arr);
        return Promise.resolve();
    }

    /**
     * @param {object} args - the satellite to display on and the sensitivity to use
     */
    setRadarSensitivity (args) {
        const outboundTopic = `sat/${args.SATELLITE}/in/radar/config`;
        this._client.publish(outboundTopic, _sensitivities[args.SENSITIVITY]);
    }

    /**
     * @param {object} args - the satellite to reboot
     */
    rebootSatellite (args) {
        const outboundTopic = `sat/${args.SATELLITE}/cmd/reboot`;
        this._client.publish(outboundTopic, [0x1]);
    }

    /**
     * Return true if touched.
     * @param {string} satellite - the satellite in question
     * @return {boolean} - whether the satelliate is being touched.
     */
    isTouched (satellite) {
        return satellite &&
        satellite !== NOT_FOUND &&
        this._satellites &&
        this._satellites !== NOT_FOUND &&
        this._satellites[satellite] &&
        this._satellites[satellite] !== NOT_FOUND &&
        this._satellites[satellite].isTouched;
    }

    /**
     * Return true if touched.
     * @param {string} satellite - the satellite in question
     * @return {boolean} - whether the satellite is detecting presence.
     */
    hasPresence (satellite) {
        return satellite &&
        satellite !== NOT_FOUND &&
        this._satellites &&
        this._satellites !== NOT_FOUND &&
        this._satellites[satellite] &&
        this._satellites[satellite] !== NOT_FOUND &&
        this._satellites[satellite].hasPresence;
    }
}

class Scratch3PlayspotBlocks {
    /**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME () {
        return 'Playspot';
    }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return 'playspot';
    }

    /**
     * @return {array} - text and values for each satellites menu element
     */
    get SATELLITES () {
        return Object.keys(this._peripheral._satellites || {}).length === 0 ?
            [{text: NOT_FOUND, value: NOT_FOUND}] :
            Object.keys(this._peripheral._satellites).map(currentValue => ({
                text: currentValue,
                value: currentValue
            }));
    }

    /**
     * @return {array} - text and values for each lights menu element
     */
    get LIGHTS () {
        return (
            Object.keys(_sequences).map(currentValue => ({
                text: currentValue,
                value: currentValue
            })) || []
        );
    }

    /**
     * @return {array} - text and values for each sounds menu element
     */
    get SOUNDS () {
        return (
            Object.keys(_sounds).map(currentValue => ({
                text: currentValue,
                value: currentValue
            })) || []
        );
    }

    /**
     * @return {array} - text and values for each images menu element
     */
    get IMAGES () {
        return (
            Object.keys(_images).map(currentValue => ({
                text: currentValue,
                value: currentValue
            })) || []
        );
    }

    /**
     * @return {array} - text and values for each volumes menu element
     */
    get VOLUMES () {
        return (
            Object.keys(_volumes).map(currentValue => ({
                text: currentValue,
                value: currentValue
            })) || []
        );
    }

    /**
     * @return {array} - text and values for each volumes menu element
     */
    get SENSITIVITIES () {
        return (
            Object.keys(_sensitivities).map(currentValue => ({
                text: currentValue,
                value: currentValue
            })) || []
        );
    }

    /**
     * Construct a set of Playspot blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        /**
         * The Playspot handler.
         * @type {Playspot}
         */
        this._peripheral = new Playspot(this.runtime, Scratch3PlayspotBlocks.EXTENSION_ID);
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        const defaultSatellite =
          Object.keys(this._peripheral._satellites).length === 0 ?
              NOT_FOUND : this._peripheral._satellites[0];
        return {
            id: Scratch3PlayspotBlocks.EXTENSION_ID,
            name: Scratch3PlayspotBlocks.EXTENSION_NAME,
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'whenSatelliteTouched',
                    text: 'When touch detected at [SATELLITE]',
                    blockType: BlockType.HAT,
                    arguments: {
                        SATELLITE: {
                            type: ArgumentType.STRING,
                            menu: 'satellites',
                            defaultValue: defaultSatellite
                        }
                    }
                },
                {
                    opcode: 'whenAnySatelliteTouched',
                    text: 'When touch detected at any of: [SATELLITES]',
                    blockType: BlockType.HAT,
                    arguments: {
                        SATELLITES: {
                            type: ArgumentType.REPORTER
                        }
                    }
                },
                {
                    opcode: 'isSatelliteTouched',
                    text: 'is Satellite [SATELLITE] being touched?',
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        SATELLITE: {
                            type: ArgumentType.STRING,
                            menu: 'satellites',
                            defaultValue: defaultSatellite
                        }
                    }
                },
                {
                    opcode: 'areSatellitesTouched',
                    text: 'Are any of [SATELLITES] being touched?',
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        SATELLITES: {
                            type: ArgumentType.REPORTER
                        }
                    }
                },
                '---',
                {
                    opcode: 'whenPresenceSensed',
                    text: 'When presence detected at: [SATELLITE]',
                    blockType: BlockType.HAT,
                    arguments: {
                        SATELLITE: {
                            type: ArgumentType.STRING,
                            menu: 'satellites',
                            defaultValue: defaultSatellite
                        }
                    }
                },
                {
                    opcode: 'whenAnyPresenceSensed',
                    text: 'When presence detected at any of: [SATELLITES]',
                    blockType: BlockType.HAT,
                    arguments: {
                        SATELLITES: {
                            type: ArgumentType.REPORTER
                        }
                    }
                },
                {
                    opcode: 'isPresenceSensed',
                    text: 'Is [SATELLITE] sensing presence?',
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        SATELLITE: {
                            type: ArgumentType.STRING,
                            menu: 'satellites',
                            defaultValue: defaultSatellite
                        }
                    }
                },
                {
                    opcode: 'arePresencesSensed',
                    text: 'Are any of [SATELLITES] sensing presence?',
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        SATELLITES: {
                            type: ArgumentType.REPORTER
                        }
                    }
                },
                '---',
                {
                    opcode: 'displayLightSequence',
                    text: 'Display Light [SEQUENCE] on [SATELLITE]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SATELLITE: {
                            type: ArgumentType.STRING,
                            menu: 'satellites',
                            defaultValue: defaultSatellite
                        },
                        SEQUENCE: {
                            type: ArgumentType.STRING,
                            menu: 'lights',
                            defaultValue: 'Blank'
                        }
                    }
                },
                {
                    opcode: 'displayLightSequenceOnAll',
                    text: 'Display Light [SEQUENCE] on all of: [SATELLITES]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SATELLITES: {
                            type: ArgumentType.REPORTER
                        },
                        SEQUENCE: {
                            type: ArgumentType.STRING,
                            menu: 'lights',
                            defaultValue: 'Blank'
                        }
                    }
                },
                {
                    opcode: 'playSound',
                    text: 'Play Sound [SOUND] on [SATELLITE]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SATELLITE: {
                            type: ArgumentType.STRING,
                            menu: 'satellites',
                            defaultValue: defaultSatellite
                        },
                        SOUND: {
                            type: ArgumentType.NUMBER,
                            menu: 'sounds',
                            defaultValue: 'Silence'
                        }
                    }
                },
                {
                    opcode: 'playSoundOnAll',
                    text: 'Play Sound [SOUNDNAME] on all of: [SATELLITES]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SATELLITES: {
                            type: ArgumentType.REPORTER
                        },
                        SOUNDNAME: {
                            type: ArgumentType.REPORTER
                        }
                    }
                },
                '---',
                {
                    opcode: 'setVolume',
                    text: 'Set Volume to [VOLUME] on [SATELLITE]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SATELLITE: {
                            type: ArgumentType.STRING,
                            menu: 'satellites',
                            defaultValue: defaultSatellite
                        },
                        VOLUME: {
                            type: ArgumentType.STRING,
                            menu: 'volumes',
                            defaultValue: 'Mute'
                        }
                    }
                },
                {
                    opcode: 'setVolumes',
                    text: 'Set Volume to [VOLUME] on [SATELLITES]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SATELLITES: {
                            type: ArgumentType.REPORTER
                        },
                        VOLUME: {
                            type: ArgumentType.STRING,
                            menu: 'volumes',
                            defaultValue: 'Mute'
                        }
                    }
                },
                {
                    opcode: 'setRadarSensitivity',
                    text: 'Set Radar Sensitivity to [SENSITIVITY] on [SATELLITE]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SATELLITE: {
                            type: ArgumentType.STRING,
                            menu: 'satellites',
                            defaultValue: defaultSatellite
                        },
                        SENSITIVITY: {
                            type: ArgumentType.STRING,
                            menu: 'sensitivities',
                            defaultValue: 'Near'
                        }
                    }
                },
                {
                    opcode: 'setRadarSensitivities',
                    text: 'Set Radar Sensitivity to [SENSITIVITY] on [SATELLITES]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SATELLITES: {
                            type: ArgumentType.REPORTER
                        },
                        SENSITIVITY: {
                            type: ArgumentType.STRING,
                            menu: 'sensitivities',
                            defaultValue: 'Near'
                        }
                    }
                },
                {
                    opcode: 'rebootSatellite',
                    text: 'Reboot Satellite [SATELLITE]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SATELLITE: {
                            type: ArgumentType.STRING,
                            menu: 'satellites',
                            defaultValue: defaultSatellite
                        }
                    }
                },
                {
                    opcode: 'rebootSatellites',
                    text: 'Reboot Satellite [SATELLITES]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SATELLITES: {
                            type: ArgumentType.REPORTER
                        }
                    }
                },
                '---',
                {
                    opcode: 'displayImage',
                    text: 'Display Image [IMAGE]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        IMAGE: {
                            type: ArgumentType.STRING,
                            menu: 'images',
                            defaultValue: 'FarmFrame'
                        }
                    }
                },
                {
                    opcode: 'displayHistogram',
                    text: 'Display Equalizer',
                    blockType: BlockType.COMMAND,
                    arguments: { }
                }
            ],
            menus: {
                satellites: this.SATELLITES,
                lights: this.LIGHTS,
                sounds: this.SOUNDS,
                images: this.IMAGES,
                volumes: this.VOLUMES,
                sensitivities: this.SENSITIVITIES
            }
        };
    }

    /**
     * Notification when satellite is touched
     * @param {object} args - the block's arguments.
     * @return {boolean} - true if the button is pressed.
     */
    whenSatelliteTouched (args) {
        if (this._peripheral.isConnected) {
            if (this._peripheral.isTouched(args.SATELLITE)) {
                return true;
            }
            return false;
        }
    }

    /**
     * Notification when satellite is touched
     * @param {object} args - the block's arguments.
     * @return {boolean} - true if the button is pressed.
     */
    whenAnySatelliteTouched (args) {
        if (this._peripheral.isConnected && args.SATELLITES) {
            const sats = args.SATELLITES.split(' ');
            for (let i = 0; i < sats.length; i++) {
                if (this._peripheral.isTouched(sats[i])) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Test whether the satellite is touched
     * @param {object} args - the block's arguments.
     * @return {boolean} - true if the button is pressed.
     */
    isSatelliteTouched (args) {
        if (this._peripheral.isConnected) {
            return this._peripheral.isTouched(args.SATELLITE);
        }
    }

    /**
     * Test whether the satellite is touched
     * @param {object} args - the block's arguments.
     * @return {boolean} - true if the button is pressed.
     */
    areSatellitesTouched (args) {
        if (this._peripheral.isConnected && args.SATELLITES) {
            const sats = args.SATELLITES.split(' ');
            for (let i = 0; i < sats.length; i++) {
                return this._peripheral.isTouched(sats[i]);
            }
        }
    }

    /**
     * Test whether the radar is fired at the satellite
     * @param {object} args - the block's arguments.
     * @return {boolean} - true if the button is pressed.
     */
    whenPresenceSensed (args) {
        if (this._peripheral.isConnected) {
            return this._peripheral.hasPresence(args.SATELLITE);
        }
    }

    /**
     * Test whether the radar is fired at the satellite
     * @param {object} args - the block's arguments.
     * @return {boolean} - true if the button is pressed.
     */
    whenAnyPresenceSensed (args) {
        if (this._peripheral.isConnected && args.SATELLITES) {
            const sats = args.SATELLITES.split(' ');
            for (let i = 0; i < sats.length; i++) {
                if (this._peripheral.hasPresence(sats[i])) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Test whether the radar is fired at the satellite
     * @param {object} args - the block's arguments.
     * @return {boolean} - true if the button is pressed.
     */
    isPresenceSensed (args) {
        if (this._peripheral.isConnected) {
            return this._peripheral.hasPresence(args.SATELLITE);
        }
    }

    /**
     * Test whether the radar is fired at the satellite
     * @param {object} args - the block's arguments.
     * @return {boolean} - true if the button is pressed.
     */
    arePresencesSensed (args) {
        if (this._peripheral.isConnected && args.SATELLITES) {
            const sats = args.SATELLITES.split(' ');
            for (let i = 0; i < sats.length; i++) {
                return this._peripheral.hasPresence(sats[i]);
            }
        }
    }

    /**
     * @param {object} args - a satellite id and a light sequence id.
     */
    displayLightSequence (args) {
        if (this._peripheral.isConnected) {
            this._peripheral.displayLightSequence(args);
        }
    }

    /**
     * @param {object} args - a satellite id and a light sequence id.
     */
    displayLightSequenceOnAll (args) {
        if (this._peripheral.isConnected && args.SATELLITES) {
            const sats = args.SATELLITES.split(' ');
            for (let i = 0; i < sats.length; i++) {
                const cmd = {SATELLITE: sats[i], SEQUENCE: args.SEQUENCE};
                this._peripheral.displayLightSequence(cmd);
            }
        }
    }

    /**
     * @param {object} args - a satellite id and a sound id.
     */
    playSound (args) {
        if (this._peripheral.isConnected) {
            this._peripheral.playSound(args);
        }
    }

    /**
     * @param {object} args - a satellite id and a sound id.
     */
    playSoundOnAll (args) {
        if (this._peripheral.isConnected && args.SATELLITES && args.SOUNDNAME) {
            const sats = args.SATELLITES.split(' ');
            for (let i = 0; i < sats.length; i++) {
                const cmd = {SATELLITE: sats[i], SOUNDNAME: args.SOUNDNAME};
                this._peripheral.playSoundByName(cmd);
            }
        }
    }

    /**
     * @param {object} args - a satellite id and a sound id.
     */
    setVolume (args) {
        if (this._peripheral.isConnected) {
            this._peripheral.setVolume(args);
        }
    }

    /**
     * @param {object} args - a satellite id and a sound id.
     */
    setVolumes (args) {
        if (this._peripheral.isConnected && args.SATELLITES) {
            const sats = args.SATELLITES.split(' ');
            for (let i = 0; i < sats.length; i++) {
                const cmd = {SATELLITE: sats[i], VOLUME: args.VOLUME};
                this._peripheral.setVolume(cmd);
            }
        }
    }


    /**
      * @param {object} args - a satellite id and a radar sensitivity id.
      */
    setRadarSensitivity (args) {
        if (this._peripheral.isConnected) {
            this._peripheral.setRadarSensitivity(args);
        }
    }

    /**
     * @param {object} args - a satellite id and a radar sensitivity id.
     */
    setRadarSensitivities (args) {
        if (this._peripheral.isConnected && args.SATELLITES) {
            const sats = args.SATELLITES.split(' ');
            for (let i = 0; i < sats.length; i++) {
                const cmd = {SATELLITE: sats[i], SENSITIVITY: args.SENSITIVITY};
                this._peripheral.setRadarSensitivity(cmd);
            }
        }
    }

    /**
     * @param {object} args - a satellite id
     */
    rebootSatellite (args) {
        if (this._peripheral.isConnected) {
            this._peripheral.rebootSatellite(args);
        }
    }

    /**
     * @param {object} args - a satellite id
     */
    rebootSatellites (args) {
        if (this._peripheral.isConnected && args.SATELLITES) {
            const sats = args.SATELLITES.split(' ');
            for (let i = 0; i < sats.length; i++) {
                const cmd = {SATELLITE: sats[i]};
                this._peripheral.rebootSatellite(cmd);
            }
        }
    }

    /**
     * @param {object} args - an image id.
     */
    displayImage (args) {
        if (this._peripheral.isConnected) {
            this._peripheral.displayImage(args);
        }
    }

    /**
     * @param {object} args - an image id.
     */
    displayHistogram (args) {
        if (this._peripheral.isConnected) {
            this._peripheral.displayHistogram(args);
        }
    }

    /**
     * @param {object} args - void.
     * @return {void} - void.
     */
    refreshSatellites () {
        if (this._peripheral.isConnected) {
            return this._peripheral.refreshSatellites();
        }
    }
}

module.exports = Scratch3PlayspotBlocks;
