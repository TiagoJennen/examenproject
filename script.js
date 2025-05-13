window.onload = function () {
    const dateContainer = document.getElementById('date-container');
    const addCustomerBtn = document.getElementById('add-customer-btn');
    const customerForm = document.getElementById('customer-form');
    const saveCustomerBtn = document.getElementById('save-customer');
    const closeFormBtn = document.getElementById('close-form');
    const summary = document.getElementById('summary-container');

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
        table.classList.add('customer-table');

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['', 'Naam Klant', 'Omschrijving', 'Type Werk', 'Werknemer', 'Pakbon', 'Acties'];

        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
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
        const name = document.getElementById('customer-name').value.trim();
        const id = document.getElementById('customer-id').value.trim();
        const endDate = document.getElementById('customer-enddate').value.trim();

        const jobTypeSelect = document.getElementById('customer-job-type');
        const jobType = jobTypeSelect.selectedOptions[0]?.text || '';

        const employeeSelect = document.getElementById('customer-employee');
        const employee = employeeSelect.selectedOptions[0]?.text || '';

        const pdfInput = document.getElementById('customer-pdf');
        const isHighPriority = document.getElementById('customer-priority').checked;

        console.log('Hoge prioriteit aangevinkt:', isHighPriority);

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

            const checkboxTd = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('customer-checkbox');
            checkbox.style.marginLeft = '100px'; // Verplaats de checkbox naar rechts
            checkboxTd.appendChild(checkbox);
            row.appendChild(checkboxTd);

            [name, id, jobType, employee].forEach(text => {
                const td = document.createElement('td');
                td.textContent = text;
                td.style.padding = '5px 10px'; // Pas de padding aan
                td.style.textAlign = 'left'; // Zorg dat de tekst links wordt uitgelijnd
                row.appendChild(td);
            });

            // Voeg de PDF-kolom toe
            const pdfTd = document.createElement('td');
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

            // Voeg de Verwijderen-knop toe
            const deleteTd = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Verwijderen';
            deleteBtn.classList.add('delete-btn');

            deleteBtn.onclick = function () {
                const modal = document.getElementById('delete-modal');
                const deleteMessage = document.getElementById('delete-message');
                const confirmDeleteBtn = document.getElementById('confirm-delete');
                const cancelDeleteBtn = document.getElementById('cancel-delete');

                // Stel de melding in met de naam van de klant
                deleteMessage.textContent = `Weet je zeker dat je klant "${name}" wilt verwijderen?`;

                // Toon het modale venster
                modal.style.display = 'flex';

                // Bevestig verwijderen
                confirmDeleteBtn.onclick = function () {
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

                    // Sluit het modale venster
                    modal.style.display = 'none';
                };

                // Annuleer verwijderen
                cancelDeleteBtn.onclick = function () {
                    // Sluit het modale venster
                    modal.style.display = 'none';
                };
            };

            deleteTd.appendChild(deleteBtn);
            row.appendChild(deleteTd);

            // Voeg de rij toe aan de tabel
            tbody.appendChild(row);
            console.log('Rij toegevoegd aan tabel:', row);

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
            document.getElementById('customer-priority').checked = false;
        } else {
            alert('Vul alle velden in!');
        }
    };

    function toggleDetails(detailId, dateBox, arrow) {
        const customerDetails = document.getElementById(detailId);

        if (customerDetails.classList.contains('show')) {
            customerDetails.classList.remove('show');
            arrow.style.transform = 'rotate(0deg)';
        } else {
            customerDetails.classList.add('show');
            arrow.style.transform = 'rotate(90deg)';
        }
    }
};