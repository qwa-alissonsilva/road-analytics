document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const analysisHistory = document.getElementById('analysisHistory');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('highlight');
    }

    function unhighlight(e) {
        dropZone.classList.remove('highlight');
    }

    dropZone.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFileSelect, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                displayImage(file);
                analyzeImage(file);
            } else {
                alert('Por favor, selecione apenas arquivos de imagem.');
            }
        }
    }

    function displayImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            document.querySelector('.upload-placeholder').style.display = 'none';
        }
        reader.readAsDataURL(file);
    }

    async function analyzeImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Erro na análise da imagem');
            }

            const result = await response.json();
            addToHistory(result, file);
            resetUploadArea();
            
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao analisar imagem: ' + error.message);
        }
    }

    function resetUploadArea() {
        preview.src = '';
        preview.style.display = 'none';
        document.querySelector('.upload-placeholder').style.display = 'block';
        fileInput.value = '';
    }

    function addToHistory(result, file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            const scorePercentage = Math.round(result.condition_score * 100);
            const scoreClass = getScoreClass(scorePercentage);
            
            const analysisCard = document.createElement('div');
            analysisCard.className = 'analysis-card';
            
            const timestamp = new Date().toLocaleString('pt-BR');
            
            analysisCard.innerHTML = `
                <div class="analysis-image">
                    <img src="${imageUrl}" alt="Imagem analisada">
                </div>
                <div class="analysis-metrics">
                    <div class="metric-header">
                        <h3>Condição Geral</h3>
                        <div class="score-circle ${scoreClass}">
                            <span class="score-value">${scorePercentage}%</span>
                        </div>
                    </div>
                    <div class="metrics-grid">
                        <div class="metric">
                            <span class="metric-label">Iluminação</span>
                            <div class="metric-bar">
                                <div class="metric-fill ${getMetricClass(result.analysis_details.brightness_score)}" 
                                     style="width: ${result.analysis_details.brightness_score * 100}%"></div>
                            </div>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Uniformidade</span>
                            <div class="metric-bar">
                                <div class="metric-fill ${getMetricClass(result.analysis_details.uniformity_score)}"
                                     style="width: ${result.analysis_details.uniformity_score * 100}%"></div>
                            </div>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Rachaduras</span>
                            <div class="metric-bar">
                                <div class="metric-fill ${getMetricClass(result.analysis_details.crack_detection_score)}"
                                     style="width: ${result.analysis_details.crack_detection_score * 100}%"></div>
                            </div>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Textura</span>
                            <div class="metric-bar">
                                <div class="metric-fill ${getMetricClass(result.analysis_details.texture_quality)}"
                                     style="width: ${result.analysis_details.texture_quality * 100}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="analysis-details">
                        <div class="problems">
                            <h4>Problemas Detectados</h4>
                            <ul class="problems-list">
                                ${result.detected_problems.map(problem => `<li>${problem}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="recommendations">
                            <h4>Recomendações</h4>
                            <ul class="recommendations-list">
                                ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="analysis-timestamp">
                        <i class="far fa-clock"></i>
                        <span>${timestamp}</span>
                    </div>
                </div>
            `;
            
            analysisHistory.insertBefore(analysisCard, analysisHistory.firstChild);
        }
        reader.readAsDataURL(file);
    }

    function getScoreClass(score) {
        if (score <= 50) return 'score-critical';
        if (score <= 60) return 'score-warning';
        return 'score-good';
    }

    function getMetricClass(value) {
        const score = value * 100;
        if (score <= 50) return 'critical';
        if (score <= 60) return 'warning';
        return 'good';
    }
}); 