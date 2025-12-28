document.addEventListener('DOMContentLoaded', () => {
    console.log("Interactions.js loaded - Event Delegation Active");

    const tbody = document.getElementById('recentChatsBody');
    const modal = document.getElementById('interactionModal');

    // Safety check
    if (!tbody || !modal) {
        console.error("Critical elements not found: ", { tbody, modal });
        return;
    }

    // Event Delegation: Listen on the TBODY
    tbody.addEventListener('click', (e) => {
        // Find closest TR parent of the clicked element
        const row = e.target.closest('tr[data-chat-id]');

        if (row) {
            const chatId = row.dataset.chatId;
            console.log("Row clicked, Chat ID:", chatId);
            openInteraction(chatId);
        }
    });

    // Close Modal Handler
    window.closeInteraction = function () { // Expose if needed or attach to button
        modal.classList.add('hidden');
        modal.classList.remove('flex'); // Remove flex when hiding
    }

    // Attach close button listener if it exists
    const closeBtn = modal.querySelector('button[onclick="closeInteraction()"]');
    if (closeBtn) {
        closeBtn.removeAttribute('onclick'); // Remove inline if present to be safe
        closeBtn.addEventListener('click', closeInteraction);
    }

    function openInteraction(chatId) {
        modal.classList.remove('hidden');
        modal.classList.add('flex'); // Add flex when showing

        // Reset/Loading State
        const nameEl = document.getElementById('modalName');
        const transcriptEl = document.getElementById('modalTranscript');

        if (nameEl) nameEl.textContent = 'Loading...';
        if (transcriptEl) transcriptEl.innerHTML = '<div class="flex justify-center items-center h-full"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>';

        console.log("Fetching details for:", chatId);

        fetch(`/api/interaction/${chatId}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);

                const { lead, transcript } = data;

                // Populate Metadata
                safeSetText('modalName', lead.name || 'Unknown');
                safeSetText('modalPhone', lead.phone || '-');
                safeSetText('modalHeatScore', lead.heat_score || 0);
                safeSetText('modalBudget', lead.budget ? '$' + Number(lead.budget).toLocaleString() : '-');
                safeSetText('modalLocation', lead.location || '-');
                safeSetText('modalCall', lead.call_requested ? `Yes (${lead.best_call_time || 'Anytime'})` : 'No');
                safeSetText('modalSummary', lead.summary || 'No summary available.');

                const heatScore = parseInt(lead.heat_score) || 0;
                const heatBar = document.getElementById('modalHeatBar');
                if (heatBar) {
                    heatBar.style.width = `${heatScore}%`;
                    heatBar.className = `h-full transition-all duration-500 ${heatScore >= 80 ? 'bg-emerald-500' : heatScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`;
                }

                // Populate Transcript
                renderTranscript(transcript);
            })
            .catch(err => {
                console.error("Error loading interaction details:", err);
                safeSetText('modalName', 'Error');
                if (transcriptEl) transcriptEl.innerHTML = `<div class="text-center text-red-500 mt-10">Failed to load details.<br>${err.message}</div>`;
            });
    }

    function safeSetText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function renderTranscript(transcript) {
        const transcriptContainer = document.getElementById('modalTranscript');
        if (!transcriptContainer) return;

        if (!transcript) {
            transcriptContainer.innerHTML = '<div class="text-center text-zinc-500 mt-10">No transcript available for this session.</div>';
            return;
        }

        const lines = transcript.split('\n');
        const html = lines.map(line => {
            const isUser = line.startsWith('User:');
            const isAssistant = line.startsWith('Assistant:');
            const text = line.replace(/^(User:|Assistant:)\s*/, '');

            if (isUser) {
                return `
                    <div class="flex justify-end mb-4">
                        <div class="bg-emerald-500 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                            <p class="text-sm">${text}</p>
                        </div>
                    </div>
                `;
            } else if (isAssistant) {
                return `
                    <div class="flex justify-start mb-4">
                        <div class="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] border border-zinc-200 dark:border-zinc-700">
                            <p class="text-sm">${text}</p>
                        </div>
                    </div>
                `;
            }
            return '';
        }).join('');

        transcriptContainer.innerHTML = html;
    }
});
