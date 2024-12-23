document.addEventListener('DOMContentLoaded', async () => {
    const complaintDetails = document.getElementById('complaintDetails');
    const urlParams = new URLSearchParams(window.location.search);
    const complaintId = urlParams.get('id');

    if (!complaintId) {
        complaintDetails.innerHTML = '<p>Invalid complaint ID.</p>';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/complaint/${complaintId}`);
        const complaint = await response.json();

        if (!complaint) {
            complaintDetails.innerHTML = '<p>Complaint not found.</p>';
            return;
        }

        // Populate complaint details as a card
        complaintDetails.innerHTML = `
            <p><strong>ID:</strong> ${complaint._id}</p>
            <p><strong>Name:</strong> ${complaint.name}</p>
            <p><strong>Email:</strong> ${complaint.email}</p>
            <p><strong>Mobile:</strong> ${complaint.mobile}</p>
            <p><strong>Bus Number:</strong> ${complaint.busNumber}</p>
            <p><strong>Complaint Type:</strong> ${complaint.complaintType}</p>
            <p><strong>Description:</strong> ${complaint.complaintDescription}</p>
            <p><strong>Status:</strong> ${complaint.status}</p>
            ${
                complaint.complaintPhoto
                    ? `<img src="${complaint.complaintPhoto}" alt="Complaint Photo">`
                    : '<p><strong>Photo:</strong> No Photo Available</p>'
            }
        `;

        // Handle "Mark as Resolved"
        document.getElementById('resolveBtn').addEventListener('click', async () => {
            try {
                const resolveResponse = await fetch(`http://localhost:3000/resolve-complaint/${complaint._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                });
                const result = await resolveResponse.json();
                alert(result.message);
                window.location.reload();
            } catch (error) {
                console.error("Error resolving complaint:", error);
                alert("Failed to update complaint status.");
            }
        });

        // Handle "Send Feedback"
        document.getElementById('feedbackBtn').addEventListener('click', () => {
            const feedback = prompt("Enter your feedback:");
            if (feedback) {
                // Simulate feedback sending
                console.log(`Feedback sent: ${feedback}`);
                alert("Feedback sent successfully.");
            }
        });
    } catch (error) {
        console.error("Error loading complaint details:", error);
        complaintDetails.innerHTML = '<p>Error loading complaint details.</p>';
    }
});
