/** @format */

const siteFormMappings = {
	'linkedin.com': {
		firstName: [
			'input[name*="first"][name*="name" i]',
			'#firstName',
			'[aria-label*="first name" i]',
		],
		lastName: [
			'input[name*="last"][name*="name" i]',
			'#lastName',
			'[aria-label*="last name" i]',
		],
		email: ['input[type="email"]', '#email', '[aria-label*="email" i]'],
		phone: ['input[name*="phone"]', '#phone', '[aria-label*="phone" i]'],
		education: [
			'textarea[name*="education"]',
			'#education',
			'[aria-label*="education" i]',
		],
		experience: [
			'textarea[name*="experience"]',
			'#experience',
			'[aria-label*="work experience" i]',
		],
	},
	'indeed.com': {
		// Add Indeed-specific selectors
	},
	default: {
		// Default selectors for unknown sites
		firstName: ['input[name*="first"][name*="name" i]', '[name*="fname" i]'],
		lastName: ['input[name*="last"][name*="name" i]', '[name*="lname" i]'],
		email: ['input[type="email"]', 'input[name*="email" i]'],
		phone: [
			'input[type="tel"]',
			'input[name*="phone" i]',
			'input[name*="mobile" i]',
		],
		education: ['textarea[name*="education" i]', '[name*="qualification" i]'],
		experience: ['textarea[name*="experience" i]', '[name*="work" i]'],
	},
};

export const getFieldMapping = (url) => {
	const hostname = new URL(url).hostname;
	return siteFormMappings[hostname] || siteFormMappings.default;
};
