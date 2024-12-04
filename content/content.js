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
		console.log('Received fillForm message');
		fillApplicationForm()
			.then((result) => {
				console.log('Form fill result:', result);
				sendResponse({ success: result });
			})
			.catch((error) => {
				console.error('Form fill error:', error);
				sendResponse({ success: false, error: error.message });
			});
		return true;
	}
});

async function fillApplicationForm() {
	const url = window.location.href;
	const mapping = getFieldMapping(url);
	const { userProfile } = await chrome.storage.local.get('userProfile');

	console.log('User Profile:', userProfile);
	console.log('Field Mapping:', mapping);

	if (!userProfile) {
		throw new Error('No user profile found');
	}

	let filledFields = 0;
	let totalFields = Object.keys(mapping).length;

	// Handle name field specially
	if (mapping.name) {
		const nameField = document.querySelector(mapping.name[0]);
		if (nameField) {
			const fullName = `${userProfile.firstName} ${userProfile.lastName}`;
			await fillField(nameField, fullName);
			filledFields++;
		}
	}

	// Map profile fields to form fields
	const fieldMappings = {
		email: userProfile.email,
		phone: userProfile.phone,
		company: userProfile.currentCompany,
		location: userProfile.location,
		linkedin: userProfile.linkedin,
		github: userProfile.github,
		portfolio: userProfile.portfolio,
		website: userProfile.website,
		coverLetter: userProfile.coverLetter,
	};

	for (const [field, selectors] of Object.entries(mapping)) {
		if (field === 'name') continue; // Skip name as it's handled above

		const value = fieldMappings[field];
		if (!value) continue;

		for (const selector of selectors) {
			const element = document.querySelector(selector);
			if (element) {
				const success = await fillField(element, value);
				if (success) {
					console.log(`Filled field ${field} with value ${value}`);
					filledFields++;
					break;
				}
			}
		}
	}

	const successThreshold = 0.3;
	const success = filledFields / totalFields >= successThreshold;
	console.log(
		`Filled ${filledFields} out of ${totalFields} fields. Success: ${success}`,
	);
	return success;
}

async function fillField(element, value) {
	if (!value) return false;

	if (element.tagName === 'TEXTAREA') {
		element.value = value;
		element.dispatchEvent(new Event('input', { bubbles: true }));
		element.dispatchEvent(new Event('change', { bubbles: true }));
		return true;
	}

	if (element.tagName === 'INPUT') {
		if (element.type === 'file') {
			// Skip file inputs - resume upload requires different handling
			return false;
		}

		element.value = value;
		element.dispatchEvent(new Event('input', { bubbles: true }));
		element.dispatchEvent(new Event('change', { bubbles: true }));
		return true;
	}

	return false;
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
