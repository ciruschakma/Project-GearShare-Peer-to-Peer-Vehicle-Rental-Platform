document.addEventListener("DOMContentLoaded", () => {
    const bookingForms = document.querySelectorAll(".booking-form");

    bookingForms.forEach((form) => {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const data = new FormData(form);
            const url = form.action;

            try {
                const response = await fetch(url, {
                    method: "POST",
                    body: data,
                });

                const result = await response.json();
                if (result.success) {
                    alert("Booking action completed successfully!");
                    location.reload();
                } else {
                    alert(result.message || "An error occurred.");
                }
            } catch (err) {
                console.error("Error handling booking request:", err);
                alert("An error occurred. Please try again.");
            }
        });
    });
});
