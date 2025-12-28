const PDFDocument = require('pdfkit');
const moment = require('moment');
const path = require('path');
const ArabicReshaper = require('arabic-reshaper');

/**
 * PdfService
 * Handles PDF generation for reports.
 */
class PdfService {
    /**
     * Generate PDF report.
     * @param {Object} res - Express response object to pipe the PDF to.
     * @param {Array} leads - List of leads to include in the report.
     * @param {Object} filters - Filters applied to the report (for display).
     * @param {string} format - 'table' or 'cards'.
     */
    static generateReport(res, leads, filters, format) {
        const isTable = format === 'table';
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            layout: isTable ? 'landscape' : 'portrait'
        });
        const filename = `leads_report_${moment().format('YYYY-MM-DD')}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        this._registerFonts(doc);
        this._drawHeader(doc, isTable);
        this._drawFilters(doc, filters);
        this._drawSummary(doc, leads);

        if (leads.length === 0) {
            doc.fontSize(12).fillColor('#71717a').font('Arabic').text("No leads match the selected filters.", 50, 270);
        } else if (isTable) {
            this._drawTable(doc, leads);
        } else {
            this._drawCards(doc, leads);
        }

        this._drawFooter(doc, isTable);
        doc.end();
    }

    /**
     * Register fonts for the document.
     * @private
     */
    static _registerFonts(doc) {
        const fontRegular = path.join(__dirname, '../fonts/Amiri-Regular.ttf');
        const fontBold = path.join(__dirname, '../fonts/NotoSans-Bold.ttf');
        doc.registerFont('Arabic', fontRegular);
        doc.registerFont('Bold', fontBold);
    }

    /**
     * Fix Arabic text for PDFKit (Reshape + Reverse).
     * @private
     */
    static _fixArabic(text) {
        if (!text) return '';
        const hasArabic = /[\u0600-\u06FF]/.test(text);
        if (hasArabic) {
            const reshaped = ArabicReshaper.convertArabic(text);
            return reshaped.split('').reverse().join('');
        }
        return text;
    }

    /**
     * Draw report header.
     * @private
     */
    static _drawHeader(doc, isTable) {
        const pageWidth = isTable ? 841.89 : 595.28;
        doc.rect(0, 0, pageWidth, 100).fill('#18181b');
        doc.fontSize(24).fillColor('#ffffff').font('Bold').text('Sales Dashboard Report', 50, 40);
        doc.fontSize(10).fillColor('#a1a1aa').text(`Generated on: ${moment().format('MMMM Do YYYY, h:mm a')}`, 50, 70);
    }

    /**
     * Draw active filters.
     * @private
     */
    static _drawFilters(doc, filters) {
        let filterText = "Filters: ";
        const activeFilters = [];
        if (filters.minHeatScore > 0) activeFilters.push(`Heat Score >= ${filters.minHeatScore}`);
        if (filters.fullDataOnly) activeFilters.push("Full Data Only");
        if (filters.summaryOnly) activeFilters.push("With Summary");
        if (filters.callRequestedOnly) activeFilters.push("Call Requested Only");
        if (filters.startDate) activeFilters.push(`From: ${filters.startDate}`);
        if (filters.endDate) activeFilters.push(`To: ${filters.endDate}`);

        if (activeFilters.length > 0) {
            doc.fontSize(8).fillColor('#d4d4d8').text(filterText + activeFilters.join(' | '), 50, 85);
        }
        doc.fillColor('#000000');
        doc.moveDown(4);
    }

    /**
     * Draw summary cards.
     * @private
     */
    static _drawSummary(doc, leads) {
        const total = leads.length;
        const hot = leads.filter(r => parseInt(r.heat_score) > 75).length;
        const revenue = leads.reduce((acc, r) => {
            const val = r.budget ? parseInt(r.budget.replace(/[$,]/g, '')) : 0;
            return acc + (isNaN(val) ? 0 : val);
        }, 0);

        const startY = 120;
        const cardWidth = 150;
        const cardHeight = 80;
        const gap = 20;

        // Card 1
        doc.rect(50, startY, cardWidth, cardHeight).fillAndStroke('#f4f4f5', '#e4e4e7');
        doc.fillColor('#71717a').fontSize(10).font('Bold').text('Total Leads (Filtered)', 70, startY + 20);
        doc.fillColor('#18181b').fontSize(20).font('Bold').text(total, 70, startY + 40);

        // Card 2
        doc.rect(50 + cardWidth + gap, startY, cardWidth, cardHeight).fillAndStroke('#ecfdf5', '#d1fae5');
        doc.fillColor('#047857').fontSize(10).font('Bold').text('Hot Leads (>75)', 70 + cardWidth + gap, startY + 20);
        doc.fillColor('#065f46').fontSize(20).font('Bold').text(hot, 70 + cardWidth + gap, startY + 40);

        // Card 3
        doc.rect(50 + (cardWidth + gap) * 2, startY, cardWidth, cardHeight).fillAndStroke('#f4f4f5', '#e4e4e7');
        doc.fillColor('#71717a').fontSize(10).font('Bold').text('Pipeline (Filtered)', 70 + (cardWidth + gap) * 2, startY + 20);
        doc.fillColor('#18181b').fontSize(16).font('Bold').text(`$${revenue.toLocaleString()}`, 70 + (cardWidth + gap) * 2, startY + 40);

        doc.moveDown(5);
        doc.fillColor('#18181b').fontSize(16).font('Bold').text('Filtered Leads', 50, 230);
        const pageWidth = doc.page.width;
        doc.moveTo(50, 250).lineTo(pageWidth - 50, 250).strokeColor('#e4e4e7').stroke();
    }

    /**
     * Draw table view.
     * @private
     */
    static _drawTable(doc, leads) {
        const pageWidth = doc.page.width;
        let y = 270;
        const colX = { date: 50, name: 110, phone: 190, budget: 270, score: 330, call: 380, time: 430, summary: 550 };
        const colW = { date: 50, name: 70, phone: 70, budget: 50, score: 40, call: 40, time: 110, summary: 240 };

        // Header
        doc.fontSize(10).fillColor('#18181b').font('Bold');
        doc.text('Date', colX.date, y);
        doc.text('Name', colX.name, y);
        doc.text('Phone', colX.phone, y);
        doc.text('Budget', colX.budget, y);
        doc.text('Score', colX.score, y);
        doc.text('Call?', colX.call, y);
        doc.text('Call Time', colX.time, y);
        doc.text('Summary', colX.summary, y);

        y += 20;
        doc.moveTo(50, y).lineTo(pageWidth - 50, y).strokeColor('#000000').stroke();
        y += 10;

        doc.font('Arabic').fontSize(9);

        leads.forEach((lead, i) => {
            if (i % 2 === 0) {
                doc.rect(50, y - 5, pageWidth - 100, 30).fill('#f4f4f5');
                doc.fillColor('#000000');
            }

            if (y > 500) {
                doc.addPage();
                y = 50;
                // Re-draw header
                doc.fontSize(10).fillColor('#18181b').font('Bold');
                doc.text('Date', colX.date, y);
                doc.text('Name', colX.name, y);
                doc.text('Phone', colX.phone, y);
                doc.text('Budget', colX.budget, y);
                doc.text('Score', colX.score, y);
                doc.text('Call?', colX.call, y);
                doc.text('Call Time', colX.time, y);
                doc.text('Summary', colX.summary, y);
                y += 20;
                doc.moveTo(50, y).lineTo(pageWidth - 50, y).strokeColor('#000000').stroke();
                y += 10;
                doc.font('Arabic').fontSize(9);
            }

            const dateStr = moment(lead.start_time).format('MMM D');
            const budgetStr = lead.budget ? '$' + Number(lead.budget).toLocaleString() : '-';
            const score = parseInt(lead.heat_score) || 0;
            const callReq = lead.call_requested ? 'Yes' : '-';
            const callTime = lead.best_call_time || '-';

            doc.text(dateStr, colX.date, y);
            doc.text(this._fixArabic(lead.name || 'Unknown'), colX.name, y, { width: colW.name, ellipsis: true });
            doc.text(lead.phone || '-', colX.phone, y, { width: colW.phone, ellipsis: true });
            doc.text(budgetStr, colX.budget, y, { width: colW.budget, ellipsis: true });

            const scoreColor = score > 75 ? '#059669' : (score > 50 ? '#d97706' : '#dc2626');
            doc.fillColor(scoreColor).text(score, colX.score, y);
            doc.fillColor('#000000');

            if (lead.call_requested) doc.fillColor('#2563eb');
            doc.text(callReq, colX.call, y);
            doc.fillColor('#000000');
            doc.text(callTime, colX.time, y, { width: colW.time, ellipsis: true });

            doc.text(this._fixArabic(lead.summary || '-'), colX.summary, y, { width: colW.summary, height: 25, ellipsis: true });

            y += 30;
        });
    }

    /**
     * Draw cards view.
     * @private
     */
    static _drawCards(doc, leads) {
        let y = 270;
        leads.forEach((lead, i) => {
            const summaryText = this._fixArabic(lead.summary || 'No summary available.');
            doc.font('Arabic').fontSize(9);
            const summaryHeight = doc.heightOfString(summaryText, { width: 460 });
            let cardHeight = 100 + summaryHeight;
            if (lead.call_requested) cardHeight += 30;

            if (y + cardHeight > 750) {
                doc.addPage();
                y = 50;
            }

            doc.roundedRect(50, y, 500, cardHeight, 8).fillAndStroke('#ffffff', '#e4e4e7');

            // Header
            doc.font('Arabic').fontSize(14).fillColor('#18181b')
                .text(this._fixArabic(lead.name || 'Unknown Lead'), 70, y + 20);
            doc.font('Bold').fontSize(10).fillColor('#71717a')
                .text(moment(lead.start_time).format('MMM D, YYYY • h:mm a'), 50, y + 22, { align: 'right', width: 480 });
            doc.moveTo(70, y + 45).lineTo(530, y + 45).strokeColor('#f4f4f5').stroke();

            // Details
            const row1Y = y + 60;
            doc.font('Bold').fontSize(9).fillColor('#71717a').text('PHONE', 70, row1Y);
            doc.font('Bold').fontSize(10).fillColor('#18181b').text(lead.phone || 'N/A', 70, row1Y + 12);

            doc.font('Bold').fontSize(9).fillColor('#71717a').text('BUDGET', 200, row1Y);
            doc.font('Bold').fontSize(10).fillColor('#18181b')
                .text(lead.budget ? '$' + Number(lead.budget).toLocaleString() : 'N/A', 200, row1Y + 12);

            const score = parseInt(lead.heat_score) || 0;
            const scoreColor = score > 75 ? '#059669' : (score > 50 ? '#d97706' : '#dc2626');
            const scoreBg = score > 75 ? '#ecfdf5' : (score > 50 ? '#fffbeb' : '#fef2f2');

            doc.roundedRect(350, row1Y - 2, 80, 24, 12).fill(scoreBg);
            doc.font('Bold').fontSize(10).fillColor(scoreColor)
                .text(`Score: ${score}`, 350, row1Y + 5, { width: 80, align: 'center' });

            // Summary
            const row2Y = y + 95;
            doc.font('Arabic').fontSize(9).fillColor('#52525b')
                .text(summaryText, 70, row2Y, { width: 460 });

            // Call Footer
            if (lead.call_requested) {
                doc.roundedRect(50, y, 6, cardHeight, 4).fill('#3b82f6');
                doc.font('Bold').fontSize(9).fillColor('#2563eb')
                    .text(`📞 Call Requested: ${lead.best_call_time || 'Time not specified'}`, 70, y + cardHeight - 20);
            }

            y += cardHeight + 20;
        });
    }

    /**
     * Draw footer.
     * @private
     */
    static _drawFooter(doc, isTable) {
        const range = doc.bufferedPageRange();
        const pageWidth = doc.page.width;
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).fillColor('#a1a1aa').text(`Page ${i + 1} of ${range.count}`, 50, isTable ? 550 : 800, { align: 'center', width: isTable ? pageWidth - 100 : 500 });
        }
    }
}

module.exports = PdfService;
