document.addEventListener('DOMContentLoaded', async () => {
    const complaintsTable = document.getElementById('complaintsTable');

    // Fetch all complaints
    try {
        const response = await fetch('http://localhost:3000/all-complaints');
        const data = await response.json();

        if (data.complaints && data.complaints.length > 0) {
            data.complaints.forEach(complaint => {
                const row = document.createElement('tr');

                // Populate table row
                row.innerHTML = `
                    <td>${complaint._id}</td>
                    <td>${complaint.name}</td>
                    <td>${complaint.email}</td>
                    <td>${complaint.status}</td>
                    <td>
                        <button class="details-btn" data-id="${complaint._id}">View Details</button>
                    </td>
                `;
                complaintsTable.appendChild(row);
            });

            // Add click event for "View Details" buttons
            document.querySelectorAll('.details-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const complaintId = event.target.getAttribute('data-id');
                    window.location.href = `details.html?id=${complaintId}`;
                });
            });
        } else {
            complaintsTable.innerHTML = `<tr><td colspan="5">No complaints found.</td></tr>`;
        }
    } catch (error) {
        console.error("Error fetching complaints:", error);
        complaintsTable.innerHTML = `<tr><td colspan="5">Error loading complaints.</td></tr>`;
    }
});
