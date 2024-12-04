/** @format */

import { progressTracker } from './progressTracker.js';

let currentUrlIndex = 0;
let urls = [];
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds
let isAutomationPaused = false;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	switch (message.action) {
		case 'startAutomation':
			try {
				const result = await chrome.storage.local.get(['jobUrls']);
				urls = result.jobUrls || [];
				currentUrlIndex = 0;
				await progressTracker.initializeProgress(urls);
				await processNextUrl();
			} catch (error) {
				console.error('Error starting automation:', error);
				progressTracker.recordFailure(urls[currentUrlIndex], error.message);
			}
			break;
		case 'pauseAutomation':
			await pauseAutomation();
			break;
		case 'resumeAutomation':
			await resumeAutomation();
			break;
		case 'getStatus':
			sendResponse({
				isRunning: !isAutomationPaused,
				currentIndex: currentUrlIndex,
				totalUrls: urls.length
			});
			break;
	}
});

async function processNextUrl(retryCount = 0) {
	if (isAutomationPaused) {
		return;
	}
	if (currentUrlIndex >= urls.length) {
		await progressTracker.saveProgress();
		return;
	}

	const url = urls[currentUrlIndex];

	try {
		const tab = await chrome.tabs.create({ url, active: true });
		await waitForPageLoad(tab.id);
		await fillForm(tab.id);
		await progressTracker.recordSuccess(url);
		currentUrlIndex++;
		await processNextUrl();
	} catch (error) {
		console.error(`Error processing ${url}:`, error);

		if (retryCount < MAX_RETRIES) {
			await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
			await processNextUrl(retryCount + 1);
		} else {
			await progressTracker.recordFailure(url, error.message);
			currentUrlIndex++;
			await processNextUrl();
		}
	}
}

function waitForPageLoad(tabId) {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject(new Error('Page load timeout'));
		}, 30000); // 30 second timeout

		chrome.tabs.onUpdated.addListener(function listener(updatedTabId, info) {
			if (updatedTabId === tabId && info.status === 'complete') {
				chrome.tabs.onUpdated.removeListener(listener);
				clearTimeout(timeout);
				resolve();
			}
		});
	});
}

async function fillForm(tabId) {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject(new Error('Form fill timeout'));
		}, 15000); // 15 second timeout

		chrome.tabs.sendMessage(tabId, { action: 'fillForm' }, (response) => {
			clearTimeout(timeout);
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve(response);
			}
		});
	});
}

async function pauseAutomation() {
	isAutomationPaused = true;
	await chrome.storage.local.set({ automationStatus: 'paused' });
}

async function resumeAutomation() {
	isAutomationPaused = false;
	await chrome.storage.local.set({ automationStatus: 'running' });
	await processNextUrl();
}
