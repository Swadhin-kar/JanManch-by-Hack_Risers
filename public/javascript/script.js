document.getElementById('reviewForm').addEventListener('submit', async function(event) {
            event.preventDefault();

            const form = event.target;
            const formData = new FormData(form);
            const reviewData = {
                review_option: formData.get('review_option'),
                reason: formData.get('reason'),
                impact: formData.get('impact'),
                suggestion: formData.get('suggestion')
            };

            try {
                const response = await fetch('/review', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(reviewData),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Success:', result);

                // Show submission message
                document.getElementById('submissionMessage').classList.remove('d-none');

                // Scroll to the results section
                document.getElementById('submissionMessage').scrollIntoView({ behavior: 'smooth' });

            } catch (error) {
                console.error('Error:', error);
                // A simple message box instead of alert()
                document.getElementById('submissionMessage').classList.remove('d-none');
                document.getElementById('submissionMessage').innerHTML = `<h2 class="fs-4 fw-bold text-secondary mb-3">Submission Failed</h2><p class="text-danger">An error occurred. Please try again later.</p>`;
            }
        });

        // This is the corrected JavaScript to handle the radio button styling
        document.querySelectorAll('.radio-input').forEach(input => {
            input.addEventListener('change', (event) => {
                // Reset all labels to their default style
                document.querySelectorAll('.radio-label').forEach(label => {
                    label.classList.remove('btn-primary');
                    label.classList.add('btn-outline-secondary');
                });

                // Apply the selected style to the active label
                const activeLabel = document.querySelector(`label[for="${event.target.id}"]`);
                if (activeLabel) {
                    activeLabel.classList.remove('btn-outline-secondary');
                    activeLabel.classList.add('btn-primary');
                }
            });
        });