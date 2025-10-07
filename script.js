// Nếu bạn có API thật, thay đường dẫn dưới bằng URL API
fetch('./data.json')
  .then(response => response.json())
  .then(data => {
    renderTable(data);
    renderChart(data);
  });

function renderTable(data) {
  const tbody = document.getElementById('inventory-table-body');

  data.forEach(item => {
    const row = document.createElement('tr');
    const isLow = item.quantity < item.safety_stock;

    row.innerHTML = `
      <td>${item.product}</td>
      <td>${item.warehouse}</td>
      <td style="color:${isLow ? 'red' : 'green'}">${item.quantity}</td>
      <td>${item.safety_stock}</td>
    `;

    tbody.appendChild(row);
  });
}

function renderChart(data) {
  const ctx = document.getElementById('inventory-chart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(i => i.product),
      datasets: [
        {
          label: 'Tồn kho',
          data: data.map(i => i.quantity),
          backgroundColor: data.map(i =>
            i.quantity < i.safety_stock ? 'red' : 'green'
          )
        },
        {
          label: 'Tồn an toàn',
          data: data.map(i => i.safety_stock),
          backgroundColor: 'gray'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Biểu đồ tồn kho'
        }
      }
    }
  });
}
