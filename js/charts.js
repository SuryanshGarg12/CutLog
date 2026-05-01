/* ============================================
   Charts Module - Data Visualization
   ============================================ */

class ChartManager {
    /**
     * Draw simple line chart using canvas
     */
    static drawLineChart(canvas, data, options = {}) {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width || canvas.offsetWidth;
        const height = canvas.height || 300;
        
        canvas.width = width;
        canvas.height = height;

        const defaults = {
            color: '#00d4ff',
            gridColor: 'rgba(255, 255, 255, 0.1)',
            padding: 40,
            showPoints: true,
            showGrid: true,
            ...options
        };

        if (!data || data.length === 0) return;

        const values = data.map(p => p.value);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const range = maxVal - minVal || 1;

        const padding = defaults.padding;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Draw grid
        if (defaults.showGrid) {
            ctx.strokeStyle = defaults.gridColor;
            ctx.lineWidth = 1;

            // Horizontal lines
            for (let i = 0; i <= 5; i++) {
                const y = padding + (chartHeight / 5) * i;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(width - padding, y);
                ctx.stroke();

                // Y-axis labels
                const value = maxVal - (range / 5) * i;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(Math.round(value), padding - 10, y + 4);
            }

            // Vertical lines
            const step = Math.ceil(data.length / 5);
            for (let i = 0; i < data.length; i += step) {
                const x = padding + (chartWidth / (data.length - 1 || 1)) * i;
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, height - padding);
                ctx.stroke();
            }
        }

        // Draw line
        ctx.strokeStyle = defaults.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
            const y = height - padding - ((point.value - minVal) / range) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        if (defaults.showPoints) {
            ctx.fillStyle = defaults.color;
            data.forEach((point, index) => {
                const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
                const y = height - padding - ((point.value - minVal) / range) * chartHeight;

                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // X-axis labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        const labelStep = Math.ceil(data.length / 5);
        data.forEach((point, index) => {
            if (index % labelStep === 0) {
                const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
                ctx.fillText(point.label || '', x, height - 10);
            }
        });

        // Draw axes
        ctx.strokeStyle = defaults.gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
    }

    /**
     * Draw bar chart
     */
    static drawBarChart(canvas, data, options = {}) {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width || canvas.offsetWidth;
        const height = canvas.height || 300;

        canvas.width = width;
        canvas.height = height;

        const defaults = {
            colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
            gridColor: 'rgba(255, 255, 255, 0.1)',
            padding: 40,
            ...options
        };

        if (!data || data.length === 0) return;

        const maxValue = Math.max(...data.map(d => d.value));
        const padding = defaults.padding;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const barWidth = chartWidth / data.length * 0.8;
        const barGap = chartWidth / data.length * 0.2;

        // Draw grid lines
        ctx.strokeStyle = defaults.gridColor;
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = height - padding - (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw bars
        data.forEach((item, index) => {
            const x = padding + (chartWidth / data.length) * index + barGap / 2;
            const barHeight = (item.value / maxValue) * chartHeight;
            const y = height - padding - barHeight;

            const color = item.color || defaults.colors[index % defaults.colors.length];
            ctx.fillStyle = color;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth / 2, height - padding + 20);

            // Value on top
            ctx.fillStyle = color;
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(Math.round(item.value), x + barWidth / 2, y - 5);
        });
    }

    /**
     * Draw progress circle/ring
     */
    static drawProgressRing(svg, current, total, options = {}) {
        if (!svg) return;

        const defaults = {
            color: '#00d4ff',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            strokeWidth: 8,
            size: 120,
            ...options
        };

        const radius = defaults.size / 2 - defaults.strokeWidth;
        const circumference = 2 * Math.PI * radius;
        const progress = Math.min(current / total, 1);
        const offset = circumference * (1 - progress);

        // Clear SVG
        svg.innerHTML = '';

        // Create gradient
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'ringGradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('x2', '100%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#00d4ff');
        gradient.appendChild(stop1);

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#ff006e');
        gradient.appendChild(stop2);

        defs.appendChild(gradient);
        svg.appendChild(defs);

        // Background circle
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', defaults.size / 2);
        bgCircle.setAttribute('cy', defaults.size / 2);
        bgCircle.setAttribute('r', radius);
        bgCircle.setAttribute('fill', 'none');
        bgCircle.setAttribute('stroke', defaults.backgroundColor);
        bgCircle.setAttribute('stroke-width', defaults.strokeWidth);
        svg.appendChild(bgCircle);

        // Progress circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', defaults.size / 2);
        circle.setAttribute('cy', defaults.size / 2);
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', 'url(#ringGradient)');
        circle.setAttribute('stroke-width', defaults.strokeWidth);
        circle.setAttribute('stroke-dasharray', circumference);
        circle.setAttribute('stroke-dashoffset', offset);
        circle.setAttribute('stroke-linecap', 'round');
        circle.setAttribute('transform', `rotate(-90 ${defaults.size / 2} ${defaults.size / 2})`);
        circle.style.transition = 'stroke-dashoffset 0.5s ease';
        svg.appendChild(circle);
    }

    /**
     * Parse date for charts
     */
    static formatChartDate(date) {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    }

    /**
     * Prepare data for trend chart
     */
    static prepareTrendData(metrics, valueKey = 'value') {
        return metrics
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-30) // Last 30 days
            .map(m => ({
                label: this.formatChartDate(m.date),
                value: m[valueKey],
                date: m.date
            }));
    }

    /**
     * Calculate trend (up/down/stable)
     */
    static calculateTrend(data) {
        if (data.length < 2) return 'stable';

        const recent = data.slice(-7); // Last 7 days
        const older = data.slice(Math.max(0, data.length - 14), data.length - 7); // Previous 7 days

        if (recent.length === 0 || older.length === 0) return 'stable';

        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

        const diff = recentAvg - olderAvg;

        if (diff > olderAvg * 0.02) return 'up';
        if (diff < -olderAvg * 0.02) return 'down';
        return 'stable';
    }
}

// Export class
