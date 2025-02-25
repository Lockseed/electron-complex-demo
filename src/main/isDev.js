'use strict';
import electron from 'electron';

if (typeof electron === 'string') {
	throw new TypeError('Not running in an Electron environment!');
}

const isNodeEnvSet = "NODE_ENV" in process.env;
const getFromNodeEnv = process.env.NODE_ENV !== "production";

const isEnvSet = 'ELECTRON_IS_DEV' in process.env;
const getFromEnv = Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;

export default isEnvSet 
	? getFromEnv 
	: isNodeEnvSet 
		? getFromNodeEnv 
		: !electron.app.isPackaged;