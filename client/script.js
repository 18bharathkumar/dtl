// Dropdown menu toggle on hover
document.addEventListener('DOMContentLoaded', function () {
    const dropdown = document.querySelector('.nav-item.dropdown');
    
    // Show dropdown on hover
    dropdown.addEventListener('mouseenter', function () {
        const dropdownMenu = this.querySelector('.dropdown-menu');
        dropdownMenu.style.display = 'block';
    });

    // Hide dropdown on mouse leave
    dropdown.addEventListener('mouseleave', function () {
        const dropdownMenu = this.querySelector('.dropdown-menu');
        dropdownMenu.style.display = 'none';
    });
});
