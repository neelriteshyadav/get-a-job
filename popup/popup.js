/** @format */

document.addEventListener('DOMContentLoaded', async () => {
	const urlList = document.getElementById('urlList');
	const saveButton = document.getElementById('saveUrls');
	const startButton = document.getElementById('startAutomation');
	const statusMessage = document.getElementById('statusMessage');
	const profileForm = document.getElementById('profileForm');

	// Load saved URLs and profile
	const storage = await chrome.storage.local.get(['jobUrls', 'userProfile']);

	if (storage.jobUrls) {
		urlList.value = storage.jobUrls.join('\n');
	}

	if (storage.userProfile) {
		Object.entries(storage.userProfile).forEach(([field, value]) => {
			const input = document.getElementById(field);
			if (input) input.value = value;
		});
	}

	// Save URLs
	saveButton.addEventListener('click', () => {
		const urls = urlList.value.split('\n').filter((url) => url.trim() !== '');
		chrome.storage.local.set({ jobUrls: urls }, () => {
			showStatus('URLs saved successfully!');
		});
	});

	// Save Profile
	profileForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const formData = new FormData(profileForm);
		const profileData = Object.fromEntries(formData.entries());

		try {
			await chrome.storage.local.set({ userProfile: profileData });
			showStatus('Profile saved successfully!');
		} catch (error) {
			showStatus('Error saving profile: ' + error.message, true);
		}
	});

	// Start automation
	startButton.addEventListener('click', async () => {
		const storage = await chrome.storage.local.get(['userProfile', 'jobUrls']);

		if (!storage.userProfile) {
			showStatus('Please save your profile first!', true);
			return;
		}

		if (!storage.jobUrls?.length) {
			showStatus('Please add some URLs first!', true);
			return;
		}

		chrome.runtime.sendMessage({ action: 'startAutomation' });
		showStatus('Automation started...');
	});

	// Progress updates listener
	chrome.storage.onChanged.addListener((changes) => {
		if (changes.applicationProgress) {
			const progress = changes.applicationProgress.newValue;
			updateProgressDisplay(progress);
		}
	});

	function showStatus(message, isError = false) {
		statusMessage.textContent = message;
		statusMessage.style.color = isError ? 'red' : 'green';
	}

	function updateProgressDisplay(progress) {
		if (!progress) return;
		const { completed, failed, total } = progress;
		showStatus(`Progress: ${completed}/${total} completed, ${failed} failed`);
	}
});
