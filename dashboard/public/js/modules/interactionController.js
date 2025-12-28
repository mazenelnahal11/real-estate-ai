export class InteractionController {
    constructor() {
        this.modal = document.getElementById('interactionModal');
        this.tbody = document.getElementById('recentChatsBody');
        this.init();
    }

    init() {
        console.log("InteractionController Initialized");
        if (!this.modal || !this.tbody) {
            console.error("Critical elements missing");
            return;
        }
        this.bindEvents();
    }

    bindEvents() {
        // Event Delegation
        this.tbody.addEventListener('click', (e) => {
            const row = e.target.closest('tr[data-chat-id]');
            if (row) {
                const chatId = row.dataset.chatId;
                console.log("Interaction Clicked:", chatId);
                this.open(chatId);
            }
        });

        // Close Button
        window.closeInteraction = () => this.close();

        // Copy Button
        window.copyToClipboard = () => this.copyDetails();

        // Modal Background Click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
    }

    async copyDetails() {
        if (!this.currentLead) return;

        const lead = this.currentLead;
        const textToCopy = `Lead Details:
Name: ${lead.name || 'Unknown'}
Phone: ${lead.phone || 'N/A'}
Heat Score: ${lead.heat_score || 0}
Budget: ${lead.budget ? '$' + Number(lead.budget).toLocaleString() : 'N/A'}
Location: ${lead.location || 'N/A'}
Call Requested: ${lead.call_requested ? 'Yes' : 'No'}
Summary: ${lead.summary || 'N/A'}`;

        try {
            await navigator.clipboard.writeText(textToCopy);

            // Visual Feedback
            const btn = document.getElementById('copyBtn');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                btn.classList.add('bg-emerald-600', 'text-white');
                btn.classList.remove('bg-slate-100', 'dark:bg-zinc-800'); // Remove secondary styles temporarily

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove('bg-emerald-600', 'text-white');
                    btn.classList.add('bg-slate-100', 'dark:bg-zinc-800');
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to copy class', err);
        }
    }

    async open(chatId) {
        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');

        // Trigger reflow for animation
        void this.modal.offsetWidth;

        const content = this.modal.querySelector('.modal-content');
        if (content) {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }

        this.setLoadingState();

        try {
            const response = await fetch(`/api/interaction/${chatId}`);
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            this.render(data);
        } catch (error) {
            console.error("Fetch Error:", error);
            this.setErrorState(error.message);
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
            this.resetFields();
        }, 200);
    }

    setLoadingState() {
        this.resetFields();
        this.setText('modalName', 'Loading...');
    }

    resetFields() {
        this.setText('modalName', '');
        this.setText('modalPhone', '');
        this.setText('modalHeatScore', '0');
        this.setText('modalBudget', '-');
        this.setText('modalLocation', '-');
        this.setText('modalCall', '-');
        this.setText('modalSummary', 'Loading details...');

        const heatBar = document.getElementById('modalHeatBar');
        if (heatBar) {
            heatBar.style.width = '0%';
            heatBar.className = 'h-full rounded-full transition-all duration-1000 ease-out bg-zinc-700';
        }
    }

    setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    render(data) {
        const { lead } = data;
        this.currentLead = lead;

        this.setText('modalName', lead.name || 'Unknown Lead');
        this.setText('modalPhone', lead.phone || 'No phone provided');
        this.setText('modalHeatScore', lead.heat_score || 0);
        this.setText('modalBudget', lead.budget ? '$' + Number(lead.budget).toLocaleString() : 'Not specified');
        this.setText('modalLocation', lead.location || 'Not specified');
        this.setText('modalCall', lead.call_requested ? `Yes (${lead.best_call_time || 'Anytime'})` : 'No');
        this.setText('modalSummary', lead.summary || 'No summary available.');

        // Heat Bar Color
        const heatScore = parseInt(lead.heat_score) || 0;
        const heatBar = document.getElementById('modalHeatBar');
        if (heatBar) {
            // animate width
            setTimeout(() => {
                heatBar.style.width = `${heatScore}%`;
            }, 100);

            let colorClass = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
            if (heatScore >= 50) colorClass = 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
            if (heatScore >= 80) colorClass = 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';

            heatBar.className = `h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`;
        }
    }

    setErrorState(msg) {
        this.setText('modalName', 'Error Loading Data');
        this.setText('modalSummary', 'Could not fetch interaction details. Please try again.');
    }
}

// Auto-initialize
const interactionController = new InteractionController();
