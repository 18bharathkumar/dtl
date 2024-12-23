// Form submission handler for submitting a complaint
document.getElementById('complaintForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const requiredFields = event.target.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    // Validate required fields
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.border = "2px solid red"; // Highlight invalid fields
        } else {
            field.style.border = ""; // Clear the red border if valid
        }
    });

    if (!isValid) {
        alert('Please fill out all required fields before submitting.');
        return;
    }

    // Send complaint data to the server
    try {
        const response = await fetch('http://localhost:3000/submit-complaint', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.message || 'Failed to submit the complaint.'}`);
            return;
        }

        const result = await response.json();
      
        event.target.reset(); // Clear the form on successful submission
    } catch (error) {
        console.error("Error submitting complaint:", error);
      
    }
});

// Form submission handler for checking complaint status
document.getElementById('statusForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const query = document.getElementById('query').value.trim();
    if (!query) {
        alert("Please enter a valid mobile number or email to track the status.");
        return;
    }

    try {
        const response = await fetch(`/complaint-status?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            alert("Error fetching complaint status. Please try again.");
            return;
        }

        const result = await response.json();
        const statusMessage = result.status
            ? `Complaint Status: ${result.status}`
            : 'No complaint found for the provided details.';
        document.getElementById('statusResult').innerText = statusMessage;
    } catch (error) {
        console.error("Error checking status:", error);
        alert("An unexpected error occurred while checking the complaint status.");
    }
});

// Handle dynamic visibility of the Bus Number field based on Complaint Type
const complaintTypeField = document.getElementById('complaintType');
const busNumberField = document.getElementById('busNumberField');

complaintTypeField.addEventListener('change', () => {
    const selectedComplaintType = complaintTypeField.value;

    if (selectedComplaintType === 'Crew Complaint' || selectedComplaintType === 'Bus Condition') {
        busNumberField.style.display = 'block'; // Show the Bus Number field
        document.getElementById('busNumber').setAttribute('required', 'true'); // Mark as required
    } else {
        busNumberField.style.display = 'none'; // Hide the Bus Number field
        document.getElementById('busNumber').removeAttribute('required'); // Remove required attribute
    }
});

// Trigger visibility check on page load (for any pre-selected value)
complaintTypeField.dispatchEvent(new Event('change'));
