window.onload = function() {
    const dateContainer = document.getElementById('date-container');
    const addCustomerBtn = document.getElementById('add-customer-btn');
    const customerForm = document.getElementById('customer-form');
    const saveCustomerBtn = document.getElementById('save-customer');
    const cancelCustomerBtn = document.getElementById('cancel-customer');

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
        dateText.textContent = currentDate.toLocaleDateString('nl-NL');
        dateBox.appendChild(arrow);
        dateBox.appendChild(dateText);

        dateBox.onclick = function() {
            const detailId = 'details-' + currentDate.toISOString().split('T')[0];
            toggleDetails(detailId, dateBox, arrow);
            dateContainer.scrollTop = dateBox.offsetTop - dateContainer.offsetTop;
        };

        arrow.onclick = function(event) {
            event.stopPropagation();
            const detailId = 'details-' + currentDate.toISOString().split('T')[0];
            toggleDetails(detailId, dateBox, arrow);
            dateContainer.scrollTop = dateBox.offsetTop - dateContainer.offsetTop;
        };

        const customerDetails = document.createElement('div');
        customerDetails.classList.add('customer-details');
        customerDetails.id = 'details-' + currentDate.toISOString().split('T')[0];
        allDateBoxes.push({ dateBox, customerDetails, currentDate });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    allDateBoxes.forEach(item => {
        dateContainer.appendChild(item.dateBox);
        dateContainer.appendChild(item.customerDetails);
    });

    addCustomerBtn.onclick = function() {
        customerForm.style.display = 'block'; 
    };

    cancelCustomerBtn.onclick = function() {
        customerForm.style.display = 'none'; 
    };

    saveCustomerBtn.onclick = function() {
        const name = document.getElementById('customer-name').value;
        const id = document.getElementById('customer-id').value;

        if (name && id) {
            alert(`Klant opgeslagen: ${name} - ${id}`);
            customerForm.style.display = 'none';
        } else {
            alert('Vul alle velden in.');
        }
    };
};

function toggleDetails(detailId, dateBox, arrow) {
    const customerDetails = document.getElementById(detailId);
    if (customerDetails.style.display === 'block') {
        customerDetails.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    } else {
        customerDetails.style.display = 'block';
        arrow.style.transform = 'rotate(90deg)';
    }
}

document.getElementById('close-form').addEventListener('click', function() {
    document.getElementById('customer-form').style.display = 'none';
});
