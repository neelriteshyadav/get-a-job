/** @format */

function getFieldMapping(url) {
	if (url.includes('jobs.lever.co')) {
		return {
			name: ['input[name="name"]'],
			email: ['input[name="email"]'],
			phone: ['input[name="phone"]'],
			company: ['input[name="org"]'],
			location: ['input[name="location"]'],
			linkedin: ['input[name="urls[LinkedIn]"]'],
			github: ['input[name="urls[GitHub]"]'],
			portfolio: ['input[name="urls[Portfolio]"]'],
			website: ['input[name="urls[Other]"]'],
			coverLetter: ['textarea[name="comments"]']
		};
	}
	return {};
}
