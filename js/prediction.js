document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('predictionChart').getContext('2d');
    let predictionChart = new Chart(ctx, {
        type: 'line',
        data: { datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: false } }
        }
    });

    // Fungsi untuk memprediksi
    async function runPrediction(symbol, days) {
        try {
            const response = await fetch('http://localhost:5000/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, days })
            });
            
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Prediction error:', error);
            return null;
        }
    }

    // Update chart prediksi
    function updatePredictionChart(historical, predicted) {
        const historicalDates = Array.from({length: historical.length}, (_, i) => `Day -${historical.length - i}`);
        const predictedDates = Array.from({length: predicted.length}, (_, i) => `Day +${i+1}`);
        
        predictionChart.data.labels = [...historicalDates, ...predictedDates];
        predictionChart.data.datasets = [
            {
                label: 'Data Historis',
                data: [...historical, ...Array(predicted.length).fill(null)],
                borderColor: 'rgba(52, 152, 219, 1)',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true
            },
            {
                label: 'Prediksi',
                data: [...Array(historical.length).fill(null), ...predicted],
                borderColor: 'rgba(231, 76, 60, 1)',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: true
            }
        ];
        predictionChart.update();
    }

    // Event listener untuk prediksi
    document.getElementById('runPrediction').addEventListener('click', async function() {
        const symbol = document.getElementById('predictionStock').value;
        const days = document.getElementById('timeHorizon').value;
        
        if (!symbol) {
            alert('Pilih saham terlebih dahulu');
            return;
        }
        
        const result = await runPrediction(symbol, parseInt(days));
        if (result) {
            updatePredictionChart(result.historical, result.predicted);
            
            // Update metrics
            document.getElementById('accuracy').textContent = `${result.accuracy.toFixed(1)}%`;
            
            const change = ((result.predicted.slice(-1)[0] / result.historical.slice(-1)[0]) - 1) * 100;
            document.getElementById('predictedPrice').textContent = 
                `$${result.predicted.slice(-1)[0].toFixed(2)} (${change.toFixed(2)}%)`;
                
            document.getElementById('confidence').textContent = `${result.confidence.toFixed(1)}%`;
            
            // Generate insight
            let insight;
            if (change > 5) {
                insight = `Model memprediksi kinerja kuat untuk ${symbol} dalam ${days} hari ke depan. Pertimbangkan untuk membeli.`;
            } else if (change < -3) {
                insight = `Model memprediksi penurunan untuk ${symbol}. Pertimbangkan untuk menjual.`;
            } else {
                insight = `Model memprediksi pergerakan sideways untuk ${symbol}. Pertimbangkan untuk hold.`;
            }
            
            document.getElementById('predictionInsight').textContent = insight;
        } else {
            alert('Gagal menjalankan prediksi');
        }
    });
});