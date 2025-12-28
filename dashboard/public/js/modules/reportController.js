export class ReportController {
    constructor() {
        this.modal = document.getElementById('reportModal');
        this.openBtn = document.getElementById('openReportModalBtn');
        this.closeBtns = document.querySelectorAll('.close-report-modal');
        this.init();
    }

    init() {
        if (!this.modal) return;
        this.bindEvents();
    }

    bindEvents() {
        // Open
        if (this.openBtn) {
            this.openBtn.addEventListener('click', () => this.open());
        }

        // Close (Multiple buttons might close it)
        this.closeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });

        // Close on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        // Form submission (optional: add validatoin or async handling if needed, 
        // but default default GET submission is fine for downloads)
        const form = this.modal.querySelector('form');
        if (form) {
            form.addEventListener('submit', () => {
                // Optional: Helper to close modal after delay
                setTimeout(() => this.close(), 500);
            });
        }
    }

    open() {
        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');

        // Reflow
        void this.modal.offsetWidth;

        const content = this.modal.querySelector('.modal-content');
        if (content) {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }
    }

    close() {
        const content = this.modal.querySelector('.modal-content');
        if (content) {
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
        }

        setTimeout(() => {
            this.modal.classList.add('hidden');
            this.modal.classList.remove('flex');
        }, 200);
    }
}

// Auto-init
const reportController = new ReportController();
