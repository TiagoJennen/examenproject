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
        const dateStr = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0];
        console.log('Datum met tijdzonecorrectie gegenereerd in loop:', dateStr);
        dateText.textContent = currentDate.toLocaleDateString('nl-NL');

        dateBox.appendChild(arrow);
        dateBox.appendChild(dateText);

        const detailId = 'details-' + dateStr;
        console.log('Detail ID aangemaakt:', detailId); 

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
        table.classList.add('customer-table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Naam Klant', 'Omschrijving', 'Type Werk', 'Werknemer', 'Pakbon'];

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
        console.log('Tabel body ID aangemaakt:', tbody.id); 
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
        const name = document.getElementById('customer-name').value.trim();
        const id = document.getElementById('customer-id').value.trim();
        const endDate = document.getElementById('customer-enddate').value.trim();
    
        const jobTypeSelect = document.getElementById('customer-job-type');
        const jobType = jobTypeSelect.selectedOptions[0]?.text || '';
    
        const employeeSelect = document.getElementById('customer-employee');
        const employee = employeeSelect.selectedOptions[0]?.text || '';
    
        const pdfInput = document.getElementById('customer-pdf');
    
        if (!endDate) {
            alert('Selecteer een datum in het formulier!');
            return;
        }
    
        const dateStr = new Date(new Date(endDate).getTime() - new Date(endDate).getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0];
    
        if (name && id && jobType && employee) {
            const tbody = document.getElementById(`table-body-${dateStr}`);
            if (!tbody) {
                alert('Er is een probleem met de geselecteerde datum.');
                return;
            }
    
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
    
            const deleteTd = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Verwijderen';
            deleteBtn.style.padding = '5px 10px';
            deleteBtn.style.backgroundColor = '#ff4d4d';
            deleteBtn.style.color = '#fff';
            deleteBtn.style.border = 'none';
            deleteBtn.style.cursor = 'pointer';
    
            deleteBtn.onclick = function () {
                tbody.removeChild(row);
    
                const debugMessage = document.createElement('div');
                debugMessage.classList.add('debug-message');
                debugMessage.textContent = `Klant "${name}" verwijderd van datum ${dateStr}`;
                summary.appendChild(debugMessage);
    
                setTimeout(() => {
                    debugMessage.classList.add('show');
                }, 10);
    
                setTimeout(() => {
                    debugMessage.classList.remove('show');
                    setTimeout(() => {
                        summary.removeChild(debugMessage);
                    }, 300);
                }, 5000);
            };
    
            deleteTd.appendChild(deleteBtn);
            row.appendChild(deleteTd);
    
            tbody.appendChild(row);
    
            const summaryItem = document.createElement('div');
            summaryItem.classList.add('summary-item');
            summaryItem.textContent = `${name} (${jobType}) toegevoegd voor ${dateStr}`;
            summary.appendChild(summaryItem);
    
            setTimeout(() => {
                summaryItem.classList.add('show');
            }, 10);
    
            setTimeout(() => {
                summaryItem.classList.remove('show');
                setTimeout(() => {
                    summary.removeChild(summaryItem);
                }, 300);
            }, 5000);
    
            customerForm.style.display = 'none';
            document.getElementById('customer-name').value = '';
            document.getElementById('customer-id').value = '';
            document.getElementById('customer-enddate').value = '';
            jobTypeSelect.selectedIndex = 0;
            employeeSelect.selectedIndex = 0;
            document.getElementById('customer-pdf').value = '';
        } else {
            alert('Vul alle velden in!');
        }
    };

    function toggleDetails(detailId, dateBox, arrow) {
        const customerDetails = document.getElementById(detailId);

        if (customerDetails.classList.contains('show')) {
            customerDetails.classList.remove('show');
            arrow.style.transform = 'rotate(0deg)';
            selectedDateId = null; 
            console.log('Details gesloten, geselecteerde datum gereset.'); 
        } else {
            document.querySelectorAll('.customer-details.show').forEach(detail => {
                detail.classList.remove('show');
            });
            document.querySelectorAll('.arrow').forEach(arrow => {
                arrow.style.transform = 'rotate(0deg)';
            });

            customerDetails.classList.add('show');
            arrow.style.transform = 'rotate(90deg)';
            selectedDateId = detailId.replace('details-', '');
            console.log('Geselecteerde datum ingesteld op:', selectedDateId); 
        }
    }
};