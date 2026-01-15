//Works for bar, line , pie and rader.
export function createGraph(box,type) {
    // We want to put the graph in the .content div, not the main box div
    // so it doesn't overlap the drag handle
    const contentArea = box.querySelector('.content');
    contentArea.innerHTML = ""; // Clear the "Type your notes" text
    
    const GraphCanvas = document.createElement('canvas');
    GraphCanvas.className = "GraphCanvas";
    
    // Stretch to fit the content area
    GraphCanvas.style.width = "100%";
    GraphCanvas.style.height = "100%";
    
    contentArea.append(GraphCanvas);

    const ctx = GraphCanvas.getContext('2d');

    const myChart = new Chart(ctx, {
        type: type, 
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green'],
            datasets: [{
                label: 'Votes',
                data: [12, 19, 3, 5],
                backgroundColor: '#ff007a', 
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false 
        }
    });

    // Store the chart on the main box so the resize logic can find it
    box.chartInstance = myChart;
}


