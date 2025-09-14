// Global error handler for Inertia requests
export function setupGlobalErrorHandler() {
    // Handle HTTP errors globally
    const handleHttpError = (event: any) => {
        if (event.detail?.response?.status && event.detail.response.status !== 200) {
            const response = event.detail.response;
            let errorMessage = 'An error occurred';
            
            if (response.data?.message) {
                errorMessage = response.data.message;
            } else if (response.data?.errors) {
                const errors = response.data.errors;
                const errorMessages = Object.values(errors).flat();
                errorMessage = errorMessages.join(', ');
            } else if (response.status === 422) {
                errorMessage = 'Validation failed. Please check your input.';
            } else if (response.status === 500) {
                errorMessage = 'Internal server error. Please try again later.';
            } else if (response.status === 404) {
                errorMessage = 'The requested resource was not found.';
            } else if (response.status === 403) {
                errorMessage = 'You do not have permission to perform this action.';
            }

            showErrorDialog('Error', errorMessage);
        }
    };

    // Listen for Inertia error events
    document.addEventListener('inertia:error', handleHttpError);

    // Also intercept fetch requests for additional error handling
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        try {
            const response = await originalFetch(...args);
            
            // Check if response is not ok and it's an admin route
            if (!response.ok && args[0] && typeof args[0] === 'string' && args[0].includes('/admin/')) {
                const errorData = await response.json().catch(() => ({}));
                let errorMessage = 'An error occurred';
                
                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.errors) {
                    const errors = errorData.errors;
                    const errorMessages = Object.values(errors).flat();
                    errorMessage = errorMessages.join(', ');
                } else if (response.status === 422) {
                    errorMessage = 'Validation failed. Please check your input.';
                } else if (response.status === 500) {
                    errorMessage = 'Internal server error. Please try again later.';
                } else if (response.status === 404) {
                    errorMessage = 'The requested resource was not found.';
                } else if (response.status === 403) {
                    errorMessage = 'You do not have permission to perform this action.';
                }

                showErrorDialog('Error', errorMessage);
            }
            
            return response;
        } catch (error) {
            console.error('Fetch Error:', error);
            showErrorDialog('Network Error', 'A network error occurred. Please check your connection.');
            throw error;
        }
    };
}

// Function to show error dialog
function showErrorDialog(title: string, message: string) {
    // Create error dialog element
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    dialog.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
                <div class="flex items-center mb-4">
                    <div class="flex-shrink-0">
                        <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-lg font-medium text-gray-900">${title}</h3>
                    </div>
                </div>
                <div class="mb-6">
                    <p class="text-sm text-gray-700">${message}</p>
                </div>
                <div class="flex justify-end">
                    <button 
                        onclick="this.closest('.fixed').remove()"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add to document
    document.body.appendChild(dialog);

    // Auto remove after 10 seconds
    setTimeout(() => {
        if (dialog.parentNode) {
            dialog.parentNode.removeChild(dialog);
        }
    }, 10000);
}
