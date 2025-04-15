window.onload = function () {
    const dateContainer = document.getElementById('date-container');
    const addCustomerBtn = document.getElementById('add-customer-btn');
    const customerForm = document.getElementById('customer-form');
    const saveCustomerBtn = document.getElementById('save-customer');
    const closeFormBtn = document.getElementById('close-form');
    const summary = document.getElementById('summary-container');

    let selectedDateId = null;

    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(2040, 11, 31);

    let currentDate = startDate;
    let allDateBoxes = [];

    while (currentDate <= endDate) {
        const dateBox = document.createElement('div');
        dateBox.classList.add('date-box');

        const arrow = document.createElement('span');
        arrow.classList.add('arrow');

        const dateText = document.createElement('span');
        const dateStr = currentDate.toISOString().split('T')[0];
        dateText.textContent = currentDate.toLocaleDateString('nl-NL');

        dateBox.appendChild(arrow);
        dateBox.appendChild(dateText);

        const detailId = 'details-' + dateStr;

        dateBox.onclick = function () {
            toggleDetails(detailId, dateBox, arrow);
            dateContainer.scrollTop = dateBox.offsetTop - dateContainer.offsetTop;
        };

        arrow.onclick = function (event) {
            event.stopPropagation();
            toggleDetails(detailId, dateBox, arrow);
            dateContainer.scrollTop = dateBox.offsetTop - dateContainer.offsetTop;
        };

        const customerDetails = document.createElement('div');
        customerDetails.classList.add('customer-details');
        customerDetails.id = detailId;

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Klant', 'Omschrijving', 'Type werk', 'Werknemer', 'Pakbon'];

        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.borderBottom = '1px solid #999';
            th.style.padding = '8px';
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        tbody.id = `table-body-${dateStr}`;
        table.appendChild(tbody);

        customerDetails.appendChild(table);

        allDateBoxes.push({ dateBox, customerDetails, currentDate });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    allDateBoxes.forEach(item => {
        dateContainer.appendChild(item.dateBox);
        dateContainer.appendChild(item.customerDetails);
    });

    addCustomerBtn.onclick = function () {
        customerForm.style.display = 'block';
    };

    closeFormBtn.onclick = function () {
        customerForm.style.display = 'none';
    };

    saveCustomerBtn.onclick = function () {
        const name = document.getElementById('customer-name').value;
        const id = document.getElementById('customer-id').value;
        const endDate = document.getElementById('customer-enddate').value;
        const jobType = document.getElementById('customer-job-type').value;
        const employee = document.getElementById('customer-employee').value;
        const pdfInput = document.getElementById('customer-pdf');

        if (!selectedDateId) {
            alert('Klik eerst op een datum!');
            return;
        }

        if (name && id && endDate && jobType && employee) {
            const tbody = document.getElementById(`table-body-${selectedDateId}`);
            const row = document.createElement('tr');

            [name, id, jobType, employee].forEach(text => {
                const td = document.createElement('td');
                td.textContent = text;
                td.style.padding = '8px';
                row.appendChild(td);
            });

            const pdfTd = document.createElement('td');
            pdfTd.style.padding = '8px';
            if (pdfInput.files.length > 0) {
                const file = pdfInput.files[0];
                const link = document.createElement('a');
                link.href = URL.createObjectURL(file);
                link.target = '_blank';
                link.textContent = file.name;
                pdfTd.appendChild(link);
            } else {
                pdfTd.textContent = 'Geen PDF';
            }

            row.appendChild(pdfTd);
            tbody.appendChild(row);

            // Samenvatting toevoegen
            const summaryItem = document.createElement('div');
            summaryItem.textContent = `${name} (${jobType}) toegevoegd voor ${selectedDateId}`;
            summary.appendChild(summaryItem);

            // Formulier verbergen en resetten
            customerForm.style.display = 'none';
            document.getElementById('customer-name').value = '';
            document.getElementById('customer-id').value = '';
            document.getElementById('customer-enddate').value = '';
            document.getElementById('customer-job-type').value = '';
            document.getElementById('customer-employee').value = '';
            document.getElementById('customer-pdf').value = '';
        } else {
            alert('Vul alle velden in!');
        }
    };

    function toggleDetails(detailId, dateBox, arrow) {
        const customerDetails = document.getElementById(detailId);
        selectedDateId = detailId.replace('details-', '');

        if (customerDetails.style.display === 'block') {
            customerDetails.style.display = 'none';
            arrow.style.transform = 'rotate(0deg)';
        } else {
            customerDetails.style.display = 'block';
            arrow.style.transform = 'rotate(90deg)';
        }
    }
};
