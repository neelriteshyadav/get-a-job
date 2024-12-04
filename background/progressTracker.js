/** @format */

class ApplicationProgress {
	constructor() {
		this.progress = {
			total: 0,
			completed: 0,
			failed: 0,
			current: null,
			history: [],
		};
	}

	async initializeProgress(urls) {
		this.progress.total = urls.length;
		this.progress.completed = 0;
		this.progress.failed = 0;
		this.progress.history = [];
		await this.saveProgress();
	}

	async recordSuccess(url) {
		this.progress.completed++;
		this.progress.history.push({
			url,
			status: 'success',
			timestamp: new Date().toISOString(),
		});
		await this.saveProgress();
	}

	async recordFailure(url, error) {
		this.progress.failed++;
		this.progress.history.push({
			url,
			status: 'failed',
			error,
			timestamp: new Date().toISOString(),
		});
		await this.saveProgress();
	}

	async saveProgress() {
		await chrome.storage.local.set({ applicationProgress: this.progress });
	}
}

export const progressTracker = new ApplicationProgress();
