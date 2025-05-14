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

    const actionsModal = document.getElementById('actions-modal');
    const actionCheck = document.getElementById('action-check');
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

    let currentDate = startDate;
    let allDateBoxes = [];
    let savedCustomers = JSON.parse(localStorage.getItem('savedCustomers')) || {};
    let selectedRow = null;
    let selectedDateStr = null;

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
        dateBox.setAttribute('data-date', dateStr);

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

    searchButton.onclick = function () {
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
    };

    searchNameButton.onclick = function () {
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
    };

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

            const row = createCustomerRow(name, id, jobType, employee, pdfInput, dateStr, tbody);
            tbody.appendChild(row);

            row.classList.add('highlight');
            setTimeout(() => row.classList.remove('highlight'), 2000);

            if (!savedCustomers[dateStr]) savedCustomers[dateStr] = [];
            savedCustomers[dateStr].push({ name, id, jobType, employee, pdfName: pdfInput.files[0]?.name || '' });
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
    };

    function createCustomerRow(name, id, jobType, employee, pdfInput, dateStr, tbody) {
        const row = document.createElement('tr');

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

        return row;
    }

    actionCheck.onclick = function () {
        if (selectedRow) {
            selectedRow.style.textDecoration = selectedRow.style.textDecoration === 'line-through' ? 'none' : 'line-through';
        }
        actionsModal.style.display = 'none';
    };

    actionEdit.onclick = function () {
        if (selectedRow) {
            const cells = selectedRow.children;
            document.getElementById('customer-name').value = cells[1].textContent;
            document.getElementById('customer-id').value = cells[2].textContent;
            document.getElementById('customer-enddate').value = selectedDateStr;
            document.getElementById('customer-job-type').value = cells[3].textContent;
            document.getElementById('customer-employee').value = cells[4].textContent;

            customerForm.style.display = 'block';
            selectedRow.remove();
        }
        actionsModal.style.display = 'none';
    };

    actionDelete.onclick = function () {
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
    };

    cancelActions.onclick = function () {
        actionsModal.style.display = 'none';
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

    for (const dateStr in savedCustomers) {
        const tbody = document.getElementById(`table-body-${dateStr}`);
        if (tbody) {
            savedCustomers[dateStr].forEach(c => {
                const row = createCustomerRow(c.name, c.id, c.jobType, c.employee, { files: [] }, dateStr, tbody);
                tbody.appendChild(row);
            });
        }
    }
};