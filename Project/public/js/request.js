document.addEventListener("DOMContentLoaded", () => {
    // Request Approval/Rejection
    const actionButtons = document.querySelectorAll(".request-action");

    actionButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
            e.preventDefault();
            const action = button.dataset.action; // "approve" or "reject"
            const requestId = button.dataset.requestId;

            try {
                const response = await fetch(`/requests/${requestId}/${action}`, {
                    method: "POST",
                });

                const result = await response.json();
                if (result.success) {
                    alert(`Request ${action}ed successfully!`);
                    location.reload();
                } else {
                    alert(result.message || "An error occurred.");
                }
            } catch (err) {
                console.error(`Error handling request ${action}:`, err);
                alert("An error occurred. Please try again.");
            }
        });
    });

    // Request Submission
    const requestForm = document.querySelector("#request-form");
    if (requestForm) {
        requestForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(requestForm);
            const url = requestForm.action;

            try {
                const response = await fetch(url, {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();
                if (result.success) {
                    alert("Request submitted successfully!");
                    location.reload();
                } else {
                    alert(result.message || "An error occurred.");
                }
            } catch (err) {
                console.error("Error submitting request:", err);
                alert("An error occurred. Please try again.");
            }
        });
    }
});
