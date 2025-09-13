document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    let priceChart = new Chart(ctx, {
        type: 'line',
        data: { datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: false } }
        }
    });

    // Fungsi untuk mengambil data saham
    async function fetchStockData(symbol, period='1mo') {
        try {
            const response = await fetch(`http://localhost:5000/api/stock-data?symbol=${symbol}&period=${period}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching stock data:', error);
            return null;
        }
    }

    // Update chart dengan data baru
    function updateChart(data) {
        priceChart.data.labels = data.dates;
        priceChart.data.datasets = [
            {
                label: 'Harga',
                data: data.prices,
                borderColor: 'rgba(52, 152, 219, 1)',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2
            },
            {
                label: 'SMA 50',
                data: data.indicators.sma50,
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 1,
                borderDash: [5, 5]
            },
            {
                label: 'SMA 200',
                data: data.indicators.sma200,
                borderColor: 'rgba(155, 89, 182, 1)',
                borderWidth: 1,
                borderDash: [5, 5]
            }
        ];
        priceChart.update();
        
        // Update indikator
        document.getElementById('rsiValue').textContent = data.indicators.rsi.slice(-1)[0].toFixed(2);
        document.getElementById('macdValue').textContent = data.indicators.macd.slice(-1)[0].toFixed(2);
        document.getElementById('sma50Value').textContent = data.indicators.sma50.slice(-1)[0].toFixed(2);
        document.getElementById('sma200Value').textContent = data.indicators.sma200.slice(-1)[0].toFixed(2);
    }

    // Event listener untuk search button
    document.getElementById('searchStock').addEventListener('click', async function() {
        const symbol = document.getElementById('stockSymbol').value.trim();
        if (!symbol) return;
        
        const data = await fetchStockData(symbol);
        if (data) {
            updateChart(data);
        } else {
            alert('Gagal mengambil data saham');
        }
    });
});