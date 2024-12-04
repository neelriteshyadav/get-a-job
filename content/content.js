/** @format */

// Sample user profile data (in real implementation, this would come from storage)
const userProfile = {
	firstName: 'John',
	lastName: 'Doe',
	email: 'john.doe@example.com',
	phone: '1234567890',
	// Add more fields as needed
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'fillForm') {
		fillApplicationForm();
	}
});

async function fillApplicationForm() {
	const url = window.location.href;
	const mapping = getFieldMapping(url);
	const profile = await chrome.storage.local.get('userProfile');

	for (const [field, selectors] of Object.entries(mapping)) {
		let filled = false;

		for (const selector of selectors) {
			const element = document.querySelector(selector);
			if (element) {
				await fillField(element, profile[field]);
				filled = true;
				break;
			}
		}

		if (!filled) {
			console.log(`Could not find field: ${field}`);
		}
	}
}

async function fillField(element, value) {
	// Handle different input types
	if (element.tagName === 'SELECT') {
		await handleSelect(element, value);
	} else if (element.type === 'file') {
		// Skip file inputs for now
		console.log('File input detected, skipping...');
	} else {
		element.value = value;
		element.dispatchEvent(new Event('input', { bubbles: true }));
		element.dispatchEvent(new Event('change', { bubbles: true }));
	}
}

async function handleSelect(element, value) {
	// Try to find the closest matching option
	const options = Array.from(element.options);
	const bestMatch = options.find(
		(opt) =>
			opt.text.toLowerCase().includes(value.toLowerCase()) ||
			opt.value.toLowerCase().includes(value.toLowerCase()),
	);

	if (bestMatch) {
		element.value = bestMatch.value;
		element.dispatchEvent(new Event('change', { bubbles: true }));
	}
}
