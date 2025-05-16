// Multiselect dropdown openen/sluiten
window.toggleCheckboxList = function(id) {
    // Sluit eerst alle andere open dropdowns
    document.querySelectorAll('.checkbox-list').forEach(list => {
        if (list.id !== id) list.style.display = 'none';
    });
    const el = document.getElementById(id);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';

    // Sluit dropdown als je buiten klikt
    function handler(e) {
        if (!el.contains(e.target) && !e.target.closest('.selectBox')) {
            el.style.display = 'none';
            document.removeEventListener('click', handler);
        }
    }
    setTimeout(() => document.addEventListener('click', handler), 0);
};

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
    const actionEdit = document.getElementById('action-edit');
    const actionDelete = document.getElementById('action-delete');
    const cancelActions = document.getElementById('cancel-actions');

    const deleteModal = document.getElementById('delete-modal');
    const deleteMessage = document.getElementById('delete-message');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');

    const notificationContainer = document.getElementById('notification-container');

    // Multiselect helpers
    function getSelectedJobTypes() {
        return Array.from(document.querySelectorAll('#jobtype-options input[type="checkbox"]:checked')).map(cb => cb.value);
    }
    function getSelectedEmployees() {
        return Array.from(document.querySelectorAll('#employee-options input[type="checkbox"]:checked')).map(cb => cb.value);
    }
    // Reset multiselects
    function resetMultiselects() {
        document.querySelectorAll('#jobtype-options input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('#employee-options input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.getElementById('jobtype-selected-text').textContent = 'Selecteer type werk';
        document.getElementById('employee-selected-text').textContent = 'Selecteer werknemer';
    }
    // Zet multiselects bij edit
    function setMultiselectValues(jobTypes, employees) {
        document.querySelectorAll('#jobtype-options input[type="checkbox"]').forEach(cb => {
            cb.checked = jobTypes.includes(cb.value);
        });
        document.querySelectorAll('#employee-options input[type="checkbox"]').forEach(cb => {
            cb.checked = employees.includes(cb.value);
        });
        document.getElementById('jobtype-selected-text').textContent = jobTypes.length ? jobTypes.join(', ') : 'Selecteer type werk';
        document.getElementById('employee-selected-text').textContent = employees.length ? employees.join(', ') : 'Selecteer werknemer';
    }

    // Multiselect dropdowns: update geselecteerde tekst
    document.querySelectorAll('#jobtype-options input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function () {
            const selected = getSelectedJobTypes();
            document.getElementById('jobtype-selected-text').textContent = selected.length ? selected.join(', ') : 'Selecteer type werk';
        });
    });
    document.querySelectorAll('#employee-options input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function () {
            const selected = getSelectedEmployees();
            document.getElementById('employee-selected-text').textContent = selected.length ? selected.join(', ') : 'Selecteer werknemer';
        });
    });

    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(2040, 11, 31);

    let savedCustomers = JSON.parse(localStorage.getItem('savedCustomers')) || {};
    let checkedCustomers = JSON.parse(localStorage.getItem('checkedCustomers')) || {};
    let selectedRow = null;
    let selectedDateStr = null;

    // --- Toegevoegd: Toon notificatie na reload als die in localStorage staat ---
    const notificationAfterReload = localStorage.getItem('notificationAfterReload');
    if (notificationAfterReload) {
        const { message, type } = JSON.parse(notificationAfterReload);
        showNotification(message, type);
        localStorage.removeItem('notificationAfterReload');
    }

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

    // Helper om klantinfo als string te tonen (nu met datum)
    function klantInfoString(klant, datum) {
        return `Datum: ${datum}<br>Naam: ${klant.name}, Omschrijving: ${klant.id}, Type werk: ${(klant.jobTypes || [klant.jobType]).join(', ')}, Werknemer: ${(klant.employees || [klant.employee]).join(', ')}, PDF: ${klant.pdfName || 'Geen PDF'}, Hoge prioriteit: ${klant.isHighPriority ? 'Ja' : 'Nee'}`;
    }

    // Formulier resetten
    function resetCustomerForm() {
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-id').value = '';
        document.getElementById('customer-enddate').value = '';
        document.getElementById('customer-pdf').value = '';
        // Prioriteit resetten naar "nee"
        document.getElementById('priority-no-radio').checked = true;
        document.getElementById('priority-yes-radio').checked = false;
        resetMultiselects();
    }

    // --- DAG SELECTIE EN FILTERING ---
    // Maak een lijst van alle datums van vandaag t/m einddatum
    let dateList = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateStr = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0];
        dateList.push(dateStr);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Vandaag als string
    const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];

    // Bepaal of een dag relevant is (moet getoond worden)
    function isDayRelevant(dateStr) {
        if (dateStr === todayStr) return true;
        if (dateStr > todayStr) return true;
        // Check of er nog niet-afgevinkte klanten zijn op deze dag
        const klanten = savedCustomers[dateStr] || [];
        const checked = checkedCustomers[dateStr] || [];
        // Toon als er minimaal 1 klant is die NIET is afgevinkt
        return klanten.some(k =>
            !checked.some(c =>
                c.name === k.name && c.id === k.id && (c.jobTypes ? JSON.stringify(c.jobTypes) === JSON.stringify(k.jobTypes) : c.jobType === k.jobType) && (c.employees ? JSON.stringify(c.employees) === JSON.stringify(k.employees) : c.employee === k.employee)
            )
        );
    }

    // Kalender genereren (alleen relevante dagen)
    let allDateBoxes = [];
    dateList.forEach(dateStr => {
        if (!isDayRelevant(dateStr)) return;

        const dateObj = new Date(dateStr + "T00:00:00");
        const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap[monthKey]) {
            const monthBox = document.createElement('div');
            monthBox.classList.add('month-box');
            monthBox.textContent = `${dateObj.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}`;
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
        dateText.textContent = dateObj.toLocaleDateString('nl-NL');
        dateBox.setAttribute('data-date', dateStr);
        dateBox.setAttribute('data-month', monthKey);

        dateBox.appendChild(arrow);
        dateBox.appendChild(dateText);

        // Weeknummer toevoegen
        const weekNr = getWeekNumber(dateObj);
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
    });

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
            if (!isDayRelevant(dateStr)) continue;
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
            if (!isDayRelevant(dateStr)) continue;
            const customers = savedCustomers[dateStr];
            const tbody = document.getElementById(`table-body-${dateStr}`);
            const dateBox = document.querySelector(`[data-date="${dateStr}"]`);
            const customerDetails = document.getElementById(`details-${dateStr}`);
            if (customers) {
                customers.forEach((customer, index) => {
                    const employees = customer.employees || [customer.employee];
                    if (employees.some(emp => emp.toLowerCase().includes(searchEmp))) {
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

    // Edit-mode variabelen
    let editMode = false;
    let editOldDateStr = null;
    let editOldCustomer = null;

    addCustomerBtn && (addCustomerBtn.onclick = function () {
        resetCustomerForm();
        editMode = false;
        editOldDateStr = null;
        editOldCustomer = null;
        customerForm.style.display = 'block';
    });

    closeFormBtn && (closeFormBtn.onclick = function () {
        customerForm.style.display = 'none';
    });

    saveCustomerBtn && (saveCustomerBtn.onclick = function () {
        const name = document.getElementById('customer-name').value.trim();
        const id = document.getElementById('customer-id').value.trim();
        const endDate = document.getElementById('customer-enddate').value.trim();

        // Gebruik multiselect helpers
        const jobTypes = getSelectedJobTypes();
        const employees = getSelectedEmployees();

        const pdfInput = document.getElementById('customer-pdf');
        // Prioriteit ophalen uit radio buttons
        const isHighPriority = document.getElementById('priority-yes-radio').checked;

        if (!endDate) {
            alert('Selecteer een datum in het formulier!');
            return;
        }

        const dateStr = new Date(new Date(endDate).getTime() - new Date(endDate).getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0];

        if (name && id && jobTypes.length > 0 && employees.length > 0) {
            const tbody = document.getElementById(`table-body-${dateStr}`);
            if (!tbody) {
                alert('Er is een probleem met de geselecteerde datum.');
                return;
            }

            // Bouw klantobject voor melding
            const klantObj = {
                name,
                id,
                jobTypes,
                employees,
                pdfName: pdfInput.files[0]?.name || '',
                isHighPriority
            };

            if (editMode && editOldCustomer) {
                // Verwijder oude klant uit oude datum
                if (savedCustomers[editOldDateStr]) {
                    savedCustomers[editOldDateStr] = savedCustomers[editOldDateStr].filter(c =>
                        !(c.name === editOldCustomer.name && c.id === editOldCustomer.id && JSON.stringify(c.jobTypes || [c.jobType]) === JSON.stringify(editOldCustomer.jobTypes || [editOldCustomer.jobType]) && JSON.stringify(c.employees || [c.employee]) === JSON.stringify(editOldCustomer.employees || [editOldCustomer.employee]))
                    );
                    // Verwijder rij uit oude tbody als datum is gewijzigd
                    if (editOldDateStr !== dateStr) {
                        const oldTbody = document.getElementById(`table-body-${editOldDateStr}`);
                        if (oldTbody) {
                            for (let i = 0; i < oldTbody.children.length; i++) {
                                const row = oldTbody.children[i];
                                if (
                                    row.children[1].textContent === editOldCustomer.name &&
                                    row.children[2].textContent === editOldCustomer.id &&
                                    row.children[3].textContent === (editOldCustomer.jobTypes ? editOldCustomer.jobTypes.join(', ') : editOldCustomer.jobType) &&
                                    row.children[4].textContent === (editOldCustomer.employees ? editOldCustomer.employees.join(', ') : editOldCustomer.employee)
                                ) {
                                    oldTbody.removeChild(row);
                                    break;
                                }
                            }
                        }
                    }
                }
                // Voeg nieuwe klant toe
                if (!savedCustomers[dateStr]) savedCustomers[dateStr] = [];
                savedCustomers[dateStr].push(klantObj);
                localStorage.setItem('savedCustomers', JSON.stringify(savedCustomers));

                // Zet checkedCustomers entry over als klant bewerkt wordt en datum wijzigt
                if (editOldDateStr !== dateStr && checkedCustomers[editOldDateStr]) {
                    checkedCustomers[dateStr] = checkedCustomers[dateStr] || [];
                    checkedCustomers[editOldDateStr].forEach(chk => {
                        if (
                            chk.name === editOldCustomer.name &&
                            chk.id === editOldCustomer.id &&
                            JSON.stringify(chk.jobTypes || [chk.jobType]) === JSON.stringify(editOldCustomer.jobTypes || [editOldCustomer.jobType]) &&
                            JSON.stringify(chk.employees || [chk.employee]) === JSON.stringify(editOldCustomer.employees || [editOldCustomer.employee])
                        ) {
                            checkedCustomers[dateStr].push(klantObj);
                        }
                    });
                    checkedCustomers[editOldDateStr] = checkedCustomers[editOldDateStr].filter(chk =>
                        !(chk.name === editOldCustomer.name && chk.id === editOldCustomer.id && JSON.stringify(chk.jobTypes || [chk.jobType]) === JSON.stringify(editOldCustomer.jobTypes || [editOldCustomer.jobType]) && JSON.stringify(chk.employees || [chk.employee]) === JSON.stringify(editOldCustomer.employees || [editOldCustomer.employee]))
                    );
                    localStorage.setItem('checkedCustomers', JSON.stringify(checkedCustomers));
                }

                const row = createCustomerRow(name, id, jobTypes, employees, pdfInput, dateStr, tbody, isHighPriority, dateStr);
                tbody.appendChild(row);
                row.classList.add('highlight');
                setTimeout(() => row.classList.remove('highlight'), 2000);

                // --- Vervangen: showNotification door melding na reload ---
                localStorage.setItem('notificationAfterReload', JSON.stringify({
                    message: `Klant bewerkt:<br>${klantInfoString(klantObj, dateStr)}`,
                    type: 'success'
                }));
                location.reload();
            } else {
                // Toevoegen
                const row = createCustomerRow(name, id, jobTypes, employees, pdfInput, dateStr, tbody, isHighPriority, dateStr);
                tbody.appendChild(row);

                row.classList.add('highlight');
                setTimeout(() => row.classList.remove('highlight'), 2000);

                if (!savedCustomers[dateStr]) savedCustomers[dateStr] = [];
                savedCustomers[dateStr].push(klantObj);
                localStorage.setItem('savedCustomers', JSON.stringify(savedCustomers));

                // --- Vervangen: showNotification door melding na reload ---
                localStorage.setItem('notificationAfterReload', JSON.stringify({
                    message: `Klant toegevoegd:<br>${klantInfoString(klantObj, dateStr)}`,
                    type: 'success'
                }));
                location.reload();
            }

            customerForm.style.display = 'none';
            resetCustomerForm();
            editMode = false;
            editOldDateStr = null;
            editOldCustomer = null;
        } else {
            alert('Vul alle velden in!');
        }
    });

    // --- GEUPDATE FUNCTIE: klant-rij rood maken bij prioriteit en groen bij checkbox ---
    function createCustomerRow(name, id, jobTypes, employees, pdfInput, dateStr, tbody, isHighPriority = false, datumVoorMelding = null) {
        const row = document.createElement('tr');
        if (isHighPriority) row.classList.add('high-priority');

        const checkboxTd = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('customer-checkbox');
        checkbox.style.marginLeft = '100px';
        checkboxTd.appendChild(checkbox);
        row.appendChild(checkboxTd);

        [name, id, jobTypes.join(', '), employees.join(', ')].forEach(text => {
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

        // Checkbox afvinken = groen maken + opslaan in localStorage
        checkbox.addEventListener('change', function () {
            checkedCustomers[dateStr] = checkedCustomers[dateStr] || [];
            if (checkbox.checked) {
                row.classList.add('checked-row');
                // Voeg toe aan checkedCustomers
                checkedCustomers[dateStr].push({
                    name, id, jobTypes, employees
                });
            } else {
                row.classList.remove('checked-row');
                // Verwijder uit checkedCustomers
                checkedCustomers[dateStr] = checkedCustomers[dateStr].filter(c =>
                    !(c.name === name && c.id === id && JSON.stringify(c.jobTypes) === JSON.stringify(jobTypes) && JSON.stringify(c.employees) === JSON.stringify(employees))
                );
            }
            localStorage.setItem('checkedCustomers', JSON.stringify(checkedCustomers));

            // Herlaad pagina als alles afgevinkt is op een dag vóór vandaag
            if (dateStr < todayStr) {
                const klanten = savedCustomers[dateStr] || [];
                const checked = checkedCustomers[dateStr] || [];
                const allChecked = klanten.length > 0 && klanten.every(k =>
                    checked.some(c =>
                        c.name === k.name && c.id === k.id && JSON.stringify(c.jobTypes) === JSON.stringify(k.jobTypes) && JSON.stringify(c.employees) === JSON.stringify(k.employees)
                    )
                );
                if (allChecked) {
                    location.reload();
                }
            }
        });

        // Bij laden: zet checkbox en groen als nodig
        if (
            checkedCustomers[dateStr] &&
            checkedCustomers[dateStr].some(c =>
                c.name === name && c.id === id && JSON.stringify(c.jobTypes) === JSON.stringify(jobTypes) && JSON.stringify(c.employees) === JSON.stringify(employees)
            )
        ) {
            checkbox.checked = true;
            row.classList.add('checked-row');
        }

        return row;
    }

    actionEdit && (actionEdit.onclick = function () {
        if (selectedRow) {
            const cells = selectedRow.children;
            document.getElementById('customer-name').value = cells[1].textContent;
            document.getElementById('customer-id').value = cells[2].textContent;
            document.getElementById('customer-enddate').value = selectedDateStr;

            // Multiselects
            const jobTypes = cells[3].textContent.split(',').map(s => s.trim()).filter(Boolean);
            const employees = cells[4].textContent.split(',').map(s => s.trim()).filter(Boolean);
            setMultiselectValues(jobTypes, employees);

            // Prioriteit radio buttons instellen
            if (selectedRow.classList.contains('high-priority')) {
                document.getElementById('priority-yes-radio').checked = true;
                document.getElementById('priority-no-radio').checked = false;
            } else {
                document.getElementById('priority-yes-radio').checked = false;
                document.getElementById('priority-no-radio').checked = true;
            }

            // Zet editMode en onthoud oude klantinfo
            editMode = true;
            editOldDateStr = selectedDateStr;
            editOldCustomer = {
                name: cells[1].textContent,
                id: cells[2].textContent,
                jobTypes,
                employees
            };

            customerForm.style.display = 'block';
            selectedRow.remove();
        }
        actionsModal.style.display = 'none';
    });

    actionDelete && (actionDelete.onclick = function () {
        if (selectedRow) {
            const klantObj = {
                name: selectedRow.children[1].textContent,
                id: selectedRow.children[2].textContent,
                jobTypes: selectedRow.children[3].textContent.split(',').map(s => s.trim()),
                employees: selectedRow.children[4].textContent.split(',').map(s => s.trim()),
                pdfName: selectedRow.children[5].textContent,
                isHighPriority: selectedRow.classList.contains('high-priority')
            };

            deleteMessage.innerHTML = `Weet je zeker dat je klant "${klantObj.name}" wilt verwijderen?`;
            deleteModal.style.display = 'flex';

            confirmDeleteBtn.onclick = function () {
                const tbody = selectedRow.parentElement;
                tbody.removeChild(selectedRow);

                savedCustomers[selectedDateStr] = savedCustomers[selectedDateStr].filter(c =>
                    !(c.name === klantObj.name && c.id === klantObj.id && JSON.stringify(c.jobTypes) === JSON.stringify(klantObj.jobTypes) && JSON.stringify(c.employees) === JSON.stringify(klantObj.employees))
                );
                localStorage.setItem('savedCustomers', JSON.stringify(savedCustomers));

                // Ook uit checkedCustomers verwijderen
                if (checkedCustomers[selectedDateStr]) {
                    checkedCustomers[selectedDateStr] = checkedCustomers[selectedDateStr].filter(c =>
                        !(c.name === klantObj.name && c.id === klantObj.id && JSON.stringify(c.jobTypes) === JSON.stringify(klantObj.jobTypes) && JSON.stringify(c.employees) === JSON.stringify(klantObj.employees))
                    );
                    localStorage.setItem('checkedCustomers', JSON.stringify(checkedCustomers));
                }

                deleteModal.style.display = 'none';
                actionsModal.style.display = 'none';

                showNotification(
                    `Klant verwijderd:<br>${klantInfoString(klantObj, selectedDateStr)}`,
                    'error'
                );

                // Herlaad pagina als alles afgevinkt is op een dag vóór vandaag
                if (selectedDateStr < todayStr) {
                    const klanten = savedCustomers[selectedDateStr] || [];
                    const checked = checkedCustomers[selectedDateStr] || [];
                    const allChecked = klanten.length > 0 && klanten.every(k =>
                        checked.some(c =>
                            c.name === k.name && c.id === k.id && JSON.stringify(c.jobTypes) === JSON.stringify(k.jobTypes) && JSON.stringify(c.employees) === JSON.stringify(k.employees)
                        )
                    );
                    if (allChecked || klanten.length === 0) {
                        location.reload();
                    }
                }
            };

            cancelDeleteBtn && (cancelDeleteBtn.onclick = function () {
                deleteModal.style.display = 'none';
            });
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
        notificationContainer.innerHTML = message;

        if (type === 'error') {
            notificationContainer.style.backgroundColor = '#f44336';
        } else if (type === 'success') {
            notificationContainer.style.backgroundColor = '#4CAF50';
        }

        notificationContainer.style.display = 'block';

        setTimeout(() => {
            notificationContainer.style.display = 'none';
        }, 7000);
    }

    // Laad bestaande klanten uit localStorage (alleen voor relevante dagen)
    for (const dateStr in savedCustomers) {
        if (!isDayRelevant(dateStr)) continue;
        const tbody = document.getElementById(`table-body-${dateStr}`);
        if (tbody) {
        // Sorteer: eerst hoge prioriteit, dan de rest
            const sorted = [...savedCustomers[dateStr]].sort((a, b) => {
                return (b.isHighPriority === true) - (a.isHighPriority === true);
            });
            sorted.forEach(c => {
                const row = createCustomerRow(
                    c.name,
                    c.id,
                    c.jobTypes || [c.jobType],
                    c.employees || [c.employee],
                    { files: [], pdfName: c.pdfName },
                    dateStr,
                    tbody,
                    c.isHighPriority,
                    dateStr
                );
                tbody.appendChild(row);
            });
        }
    }
};