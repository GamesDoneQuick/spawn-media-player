#!/usr/bin/env node

// Native
import { spawn } from 'child_process';

// Packages
import { getAudioDevices } from 'windows-audio-devices';
import { Registry } from 'rage-edit';
import * as prompts from 'prompts';

main();

async function main(): Promise<void> {
	const audioDevicesArray = getAudioDevices();
	if (audioDevicesArray.length <= 0) {
		console.error('No audio devices found, exiting.');
		return process.exit(1);
	}

	const vlcBinaryPath = await Registry.get('HKLM\\Software\\VideoLAN\\VLC', '');
	if (!vlcBinaryPath) {
		console.error('VLC does not appear to be installed on this system, exiting.');
		return process.exit(1);
	}

	const response = await prompts([
		{
			type: 'select',
			name: 'audio_device',
			message: 'Select an audio output device',
			choices: audioDevicesArray
				.filter(device => {
					return device.kind === 'audiooutput' && device.guid.trim().length > 0;
				})
				.map(device => {
					return {
						title: device.device,
						value: {
							name: device.device,
							guid: device.guid,
						},
					};
				})
				.sort((a, b) => {
					const nameA = a.title.toUpperCase(); // ignore upper and lowercase
					const nameB = b.title.toUpperCase(); // ignore upper and lowercase
					if (nameA < nameB) {
						return -1;
					}

					if (nameA > nameB) {
						return 1;
					}

					return 0;
				}),
		},
		{
			type: 'text',
			name: 'media_path',
			message: '(Optional) Enter a media path or URL to autoplay',
		},
	]);

	const vlcArgs = [
		'--ignore-config',
		'--no-qt-privacy-ask',
		'--aout=directsound',
		`--directx-audio-device=${String(response.audio_device.guid)}`,
		`--meta-title=${String(response.audio_device.name)}`,
	];

	if (response.media_path.trim().length > 0) {
		vlcArgs.push(response.media_path);
	}

	const subprocess = spawn(vlcBinaryPath, vlcArgs, {
		detached: true,
		stdio: 'ignore',
	});
	subprocess.unref();
}
