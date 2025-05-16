window.onload = function () {
    const dateContainer = document.getElementById('date-container');
    const addCustomerBtn = document.getElementById('add-customer-btn');
    const customerForm = document.getElementById('customer-form');
    const saveCustomerBtn = document.getElementById('save-customer');
    const closeFormBtn = document.getElementById('close-form');
    const summary = document.getElementById('summary-container');
    const searchButton = document.getElementById('search-button');
    const searchDateInput = document.getElementById('search-date');
    const searchNameInput = document.getElementById('search-name');
    const searchNameButton = document.getElementById('search-name-button');
    const searchWeekInput = document.getElementById('search-week');
    const searchWeekButton = document.getElementById('search-week-button');
    const searchEmployeeInput = document.getElementById('search-employee');
    const searchEmployeeButton = document.getElementById('search-employee-button');

    const actionsModal = document.getElementById('actions-modal');
    // const actionCheck = document.getElementById('action-check'); // Verwijderd
    const actionEdit = document.getElementById('action-edit');
    const actionDelete = document.getElementById('action-delete');
    const cancelActions = document.getElementById('cancel-actions');

    const deleteModal = document.getElementById('delete-modal');
    const deleteMessage = document.getElementById('delete-message');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');

    const notificationContainer = document.getElementById('notification-container');

    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(2040, 11, 31);

    let currentDate = new Date(startDate);
    let allDateBoxes = [];
    let savedCustomers = JSON.parse(localStorage.getItem('savedCustomers')) || {};
    let selectedRow = null;
    let selectedDateStr = null;

    // Maand structuur
    let allMonthBoxes = [];
    let monthMap = {};

    // Helper voor weeknummer
    function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
        return weekNo;
    }

    // Kalender genereren
    while (currentDate <= endDate) {
        const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap[monthKey]) {
            const monthBox = document.createElement('div');
            monthBox.classList.add('month-box');
            monthBox.textContent = `${currentDate.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}`;
            monthBox.onclick = function () {
                document.querySelectorAll(`[data-month="${monthKey}"]`).forEach(day => {
                    day.style.display = day.style.display === 'none' ? '' : 'none';
                    const detailId = 'details-' + day.getAttribute('data-date');
                    document.getElementById(detailId)?.classList.remove('show');
                    day.querySelector('.arrow').style.transform = 'rotate(0deg)';
                });
            };
            dateContainer.appendChild(monthBox);
            allMonthBoxes.push(monthBox);
            monthMap[monthKey] = true;
        }

        const dateBox = document.createElement('div');
        dateBox.classList.add('date-box');

        const arrow = document.createElement('span');
        arrow.classList.add('arrow');

        const dateText = document.createElement('span');
        const dateStr = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0];
        dateText.textContent = currentDate.toLocaleDateString('nl-NL');
        dateBox.setAttribute('data-date', dateStr);
        dateBox.setAttribute('data-month', monthKey);

        dateBox.appendChild(arrow);
        dateBox.appendChild(dateText);

        // Weeknummer toevoegen
        const weekNr = getWeekNumber(currentDate);
        const weekNrSpan = document.createElement('span');
        weekNrSpan.classList.add('weeknr');
        weekNrSpan.textContent = `Week ${weekNr}`;
        dateBox.appendChild(weekNrSpan);

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

        allDateBoxes.push({ dateBox, customerDetails, dateStr });
        dateContainer.appendChild(dateBox);
        dateContainer.appendChild(customerDetails);

        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Zoek op datum
    searchButton && (searchButton.onclick = function () {
        const searchDate = searchDateInput.value;
        if (!searchDate) {
            alert('Voer een geldige datum in.');
            return;
        }

        const dateBox = document.querySelector(`[data-date="${searchDate}"]`);
        if (dateBox) {
            dateBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            dateBox.classList.add('highlight');
            setTimeout(() => dateBox.classList.remove('highlight'), 2000);
        } else {
            alert('Geen gegevens gevonden voor de opgegeven datum.');
        }
    });

    // Zoek op naam
    searchNameButton && (searchNameButton.onclick = function () {
        const searchName = searchNameInput.value.trim().toLowerCase();
        if (!searchName) {
            alert('Voer een geldige naam in.');
            return;
        }

        let found = false;

        for (const dateStr in savedCustomers) {
            const customers = savedCustomers[dateStr];
            const tbody = document.getElementById(`table-body-${dateStr}`);
            const dateBox = document.querySelector(`[data-date="${dateStr}"]`);
            const customerDetails = document.getElementById(`details-${dateStr}`);

            if (customers) {
                customers.forEach((customer, index) => {
                    if (customer.name.toLowerCase().includes(searchName)) {
                        if (customerDetails && dateBox) {
                            customerDetails.classList.add('show');
                            dateBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }

                        const row = tbody.children[index];
                        row.classList.add('highlight');
                        setTimeout(() => row.classList.remove('highlight'), 2000);

                        found = true;
                    }
                });
            }
        }

        if (!found) {
            alert('Geen klant gevonden met de opgegeven naam.');
        }
    });

    // Zoek op weeknummer (vanaf vandaag, exacte match)
    searchWeekButton && (searchWeekButton.onclick = function () {
        const weekNr = parseInt(searchWeekInput.value, 10);
        if (!weekNr) {
            alert('Voer een geldig weeknummer in.');
            return;
        }
        let found = false;
        const today = new Date();
        let closestBox = null;
        let closestDate = null;

        document.querySelectorAll('.date-box').forEach(box => {
            const weekSpan = box.querySelector('.weeknr');
            const dateStr = box.getAttribute('data-date');
            if (weekSpan && weekSpan.textContent.trim() === `Week ${weekNr}`) {
                const boxDate = new Date(dateStr);
                if (boxDate >= today && (!closestDate || boxDate < closestDate)) {
                    closestBox = box;
                    closestDate = boxDate;
                }
            }
        });

        if (closestBox) {
            closestBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            closestBox.classList.add('highlight');
            setTimeout(() => closestBox.classList.remove('highlight'), 2000);
            found = true;
        }

        if (!found) alert('Geen dagen gevonden voor deze week (vanaf vandaag).');
    });

    // Zoek op werknemer
    searchEmployeeButton && (searchEmployeeButton.onclick = function () {
        const searchEmp = searchEmployeeInput.value.trim().toLowerCase();
        if (!searchEmp) {
            alert('Voer een werknemer in.');
            return;
        }
        let found = false;
        for (const dateStr in savedCustomers) {
            const customers = savedCustomers[dateStr];
            const tbody = document.getElementById(`table-body-${dateStr}`);
            const dateBox = document.querySelector(`[data-date="${dateStr}"]`);
            const customerDetails = document.getElementById(`details-${dateStr}`);
            if (customers) {
                customers.forEach((customer, index) => {
                    if (customer.employee.toLowerCase().includes(searchEmp)) {
                        if (customerDetails && dateBox) {
                            customerDetails.classList.add('show');
                            dateBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        const row = tbody.children[index];
                        row.classList.add('highlight');
                        setTimeout(() => row.classList.remove('highlight'), 2000);
                        found = true;
                    }
                });
            }
        }
        if (!found) alert('Geen klant gevonden met deze werknemer.');
    });

    addCustomerBtn && (addCustomerBtn.onclick = function () {
        customerForm.style.display = 'block';
    });

    closeFormBtn && (closeFormBtn.onclick = function () {
        customerForm.style.display = 'none';
    });

    saveCustomerBtn && (saveCustomerBtn.onclick = function () {
        const name = document.getElementById('customer-name').value.trim();
        const id = document.getElementById('customer-id').value.trim();
        const endDate = document.getElementById('customer-enddate').value.trim();

        const jobTypeSelect = document.getElementById('customer-job-type');
        const jobType = jobTypeSelect.selectedOptions[0]?.text || '';

        const employeeSelect = document.getElementById('customer-employee');
        const employee = employeeSelect.selectedOptions[0]?.text || '';

        const pdfInput = document.getElementById('customer-pdf');
        const isHighPriority = document.getElementById('customer-priority').checked;

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

            const row = createCustomerRow(name, id, jobType, employee, pdfInput, dateStr, tbody, isHighPriority);
            tbody.appendChild(row);

            row.classList.add('highlight');
            setTimeout(() => row.classList.remove('highlight'), 2000);

            if (!savedCustomers[dateStr]) savedCustomers[dateStr] = [];
            savedCustomers[dateStr].push({ name, id, jobType, employee, pdfName: pdfInput.files[0]?.name || '', isHighPriority });
            localStorage.setItem('savedCustomers', JSON.stringify(savedCustomers));

            showNotification(`Klant "${name}" is toegevoegd.`, 'success');

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
    });

    // --- GEUPDATE FUNCTIE: klant-rij rood maken bij prioriteit en groen bij checkbox ---
    function createCustomerRow(name, id, jobType, employee, pdfInput, dateStr, tbody, isHighPriority = false) {
        const row = document.createElement('tr');
        if (isHighPriority) row.classList.add('high-priority');

        const checkboxTd = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('customer-checkbox');
        checkbox.style.marginLeft = '100px';
        checkboxTd.appendChild(checkbox);
        row.appendChild(checkboxTd);

        [name, id, jobType, employee].forEach(text => {
            const td = document.createElement('td');
            td.textContent = text;
            td.style.padding = '5px 10px';
            td.style.textAlign = 'left';
            row.appendChild(td);
        });

        const pdfTd = document.createElement('td');
        if (pdfInput.files && pdfInput.files.length > 0) {
            const file = pdfInput.files[0];
            const link = document.createElement('a');
            link.href = URL.createObjectURL(file);
            link.target = '_blank';
            link.textContent = file.name;
            pdfTd.appendChild(link);
        } else if (pdfInput.pdfName) {
            pdfTd.textContent = pdfInput.pdfName;
        } else {
            pdfTd.textContent = 'Geen PDF';
        }
        row.appendChild(pdfTd);

        const actionsTd = document.createElement('td');
        actionsTd.style.position = 'relative';

        const actionsBtn = document.createElement('button');
        actionsBtn.textContent = 'Acties';
        actionsBtn.classList.add('action-btn', 'actions-btn');
        actionsTd.appendChild(actionsBtn);

        actionsBtn.onclick = function () {
            selectedRow = row;
            selectedDateStr = dateStr;
            actionsModal.style.display = 'flex';
        };

        row.appendChild(actionsTd);

        // Checkbox afvinken = groen maken
        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                row.classList.add('checked-row');
            } else {
                row.classList.remove('checked-row');
            }
        });

        return row;
    }

    // Verwijder de afvink-actie uit het acties-menu
    // actionCheck && (actionCheck.onclick = function () { ... });

    actionEdit && (actionEdit.onclick = function () {
        if (selectedRow) {
            const cells = selectedRow.children;
            document.getElementById('customer-name').value = cells[1].textContent;
            document.getElementById('customer-id').value = cells[2].textContent;
            document.getElementById('customer-enddate').value = selectedDateStr;
            document.getElementById('customer-job-type').value = cells[3].textContent;
            document.getElementById('customer-employee').value = cells[4].textContent;
            document.getElementById('customer-priority').checked = selectedRow.classList.contains('high-priority');

            customerForm.style.display = 'block';
            selectedRow.remove();
        }
        actionsModal.style.display = 'none';
    });

    actionDelete && (actionDelete.onclick = function () {
        if (selectedRow) {
            const customerName = selectedRow.children[1].textContent; 

            deleteMessage.textContent = `Weet je zeker dat je klant "${customerName}" wilt verwijderen?`;
            deleteModal.style.display = 'flex';

            confirmDeleteBtn.onclick = function () {
                const tbody = selectedRow.parentElement;
                tbody.removeChild(selectedRow);

                savedCustomers[selectedDateStr] = savedCustomers[selectedDateStr].filter(c => c.name !== customerName);
                localStorage.setItem('savedCustomers', JSON.stringify(savedCustomers));

                deleteModal.style.display = 'none';
                actionsModal.style.display = 'none';

                showNotification(`Klant "${customerName}" is verwijderd.`, 'error');
            };

            cancelDeleteBtn.onclick = function () {
                deleteModal.style.display = 'none';
            };
        }
    });

    cancelActions && (cancelActions.onclick = function () {
        actionsModal.style.display = 'none';
    });

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

    function showNotification(message, type) {
        const notificationContainer = document.getElementById('notification-container');
        notificationContainer.textContent = message;

        if (type === 'error') {
            notificationContainer.style.backgroundColor = '#f44336'; 
        } else if (type === 'success') {
            notificationContainer.style.backgroundColor = '#4CAF50';
        }

        notificationContainer.style.display = 'block';

        setTimeout(() => {
            notificationContainer.style.display = 'none';
        }, 4000);
    }

    // Laad bestaande klanten uit localStorage
    for (const dateStr in savedCustomers) {
        const tbody = document.getElementById(`table-body-${dateStr}`);
        if (tbody) {
            savedCustomers[dateStr].forEach(c => {
                const row = createCustomerRow(
                    c.name,
                    c.id,
                    c.jobType,
                    c.employee,
                    { files: [], pdfName: c.pdfName },
                    dateStr,
                    tbody,
                    c.isHighPriority
                );
                tbody.appendChild(row);
            });
        }
    }
};