// Widget form step-by-step navigation
document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    const totalSteps = 7;
    const completedSteps = new Set();
    
    // Initialize phone mask
    initPhoneMask();
    
    // Star rating functionality
    initStarRating();
    
    // Radio button for additional work
    initAdditionalWork();
    
    // Add/remove dynamic textareas
    initDynamicTextareas();
    
    // Form submission
    initFormSubmission();
    
    // Submit button control
    initSubmitButtonControl();
    
    // Initialize step navigation
    updateStepDisplay();
    
    // Back button handler
    const btnBack = document.getElementById('btnBack');
    if (btnBack) {
        btnBack.addEventListener('click', function() {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        });
    }
    
    
    // Next button handler
    document.getElementById('btnNext').addEventListener('click', function() {
        if (validateCurrentStep()) {
            completedSteps.add(currentStep);
            if (currentStep < totalSteps) {
                goToStep(currentStep + 1);
            }
            // Step 7 doesn't have "Next" button, submit is handled by checkbox
        }
    });
    
    // Auto-advance on step completion
    initAutoAdvance();
    
    function goToStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.widget-step').forEach(step => {
            step.classList.remove('widget-step-active');
        });
        
        // Show target step
        const targetStep = document.querySelector(`.widget-step[data-step="${stepNumber}"]`);
        if (targetStep) {
            targetStep.classList.add('widget-step-active');
            currentStep = stepNumber;
            updateStepDisplay();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Отправка размера после изменения шага
            setTimeout(sendHeightToParent, 100);
        }
    }
    
    function updateStepDisplay() {
        // Update progress bar
        const progressFill = document.getElementById('progressFill');
        const progressPercent = (currentStep / totalSteps) * 100;
        progressFill.style.width = progressPercent + '%';
        
        // Update progress text
        document.getElementById('currentStepText').textContent = `Шаг ${currentStep} из ${totalSteps}`;
        
        // Show/hide back button
        const btnBack = document.getElementById('btnBack');
        if (currentStep > 1) {
            btnBack.style.display = 'inline-block';
        } else {
            btnBack.style.display = 'none';
        }
        
        // Show/hide next button
        const btnNext = document.getElementById('btnNext');
        const widgetNav = document.getElementById('widgetNav');
        
        // Show/hide navigation buttons for all steps
        if (currentStep === totalSteps) {
            // Step 7 - hide next button, submit button is handled by checkbox
            btnNext.style.display = 'none';
            widgetNav.style.display = 'flex';
        } else {
            // Steps 1-6
            btnNext.style.display = 'inline-block';
            widgetNav.style.display = 'flex';
        }
    }
    
    function validateCurrentStep() {
        const step = document.querySelector(`.widget-step[data-step="${currentStep}"]`);
        if (!step) return false;
        
        const stepType = step.getAttribute('data-type');
        const errorDiv = step.querySelector('.red-error');
        let isValid = false;
        
        if (stepType === 'input') {
            const inputs = step.querySelectorAll('input[data-step]');
            inputs.forEach(input => {
                if (input.value.trim() !== '') {
                    if (input.name === 'phone') {
                        if (!input.value.includes('_')) {
                            isValid = true;
                        }
                    } else {
                        isValid = true;
                    }
                }
            });
        } else if (stepType === 'radio') {
            const radios = step.querySelectorAll('input[type="radio"][data-step]');
            radios.forEach(radio => {
                if (radio.checked) {
                    isValid = true;
                }
            });
        } else if (stepType === 'stars') {
            const hiddenInput = step.querySelector('input[type="hidden"]');
            if (hiddenInput && hiddenInput.value !== '') {
                isValid = true;
            }
        } else if (stepType === 'bigcheckbox') {
            const checkboxes = step.querySelectorAll('input[type="checkbox"][data-step]');
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    isValid = true;
                }
            });
        } else if (stepType === 'consent') {
            const consentCheckbox = step.querySelector('input[type="checkbox"][data-step]');
            if (consentCheckbox && consentCheckbox.checked) {
                isValid = true;
            }
        }
        
        if (!isValid) {
            if (errorDiv) {
                errorDiv.style.display = 'block';
            }
            step.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }
        
        return isValid;
    }
    
    function showFinalStep() {
        // Step 6 completed, move to step 7
        completedSteps.add(currentStep);
        goToStep(7);
    }
    
    function initAutoAdvance() {
        // Just mark steps as completed when inputs change, but don't auto-advance
        // User must click "Далее" button to proceed
        document.querySelectorAll('.widget-step input[data-step], .widget-step textarea').forEach(input => {
            input.addEventListener('change', function() {
                if (validateCurrentStep()) {
                    completedSteps.add(currentStep);
                    
                    // Auto-show final step when step 6 is completed
                    if (currentStep === totalSteps) {
                        setTimeout(() => {
                            showFinalStep();
                        }, 300);
                    }
                }
            });
            
            // For text inputs, also check on blur
            if (input.type === 'text') {
                input.addEventListener('blur', function() {
                    if (validateCurrentStep()) {
                        completedSteps.add(currentStep);
                        
                        // Auto-advance to step 7 when step 6 is completed
                        if (currentStep === 6) {
                            setTimeout(() => {
                                showFinalStep();
                            }, 300);
                        }
                    }
                });
            }
        });
        
        // For checkboxes - check on change and auto-advance to step 7 for step 6
        document.querySelectorAll('.widget-step input[type="checkbox"][data-step]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (validateCurrentStep()) {
                    completedSteps.add(currentStep);
                    
                    // Auto-advance to step 7 when step 6 is completed
                    if (currentStep === 6) {
                        setTimeout(() => {
                            showFinalStep();
                        }, 300);
                    }
                    
                    // For step 7 consent checkbox - validate step
                    if (currentStep === 7) {
                        const step = this.closest('.widget-step');
                        const errorDiv = step?.querySelector('.red-error');
                        if (errorDiv) {
                            errorDiv.style.display = 'none';
                        }
                    }
                } else {
                    // Show error if step 7 consent is not checked
                    if (currentStep === 7) {
                        const step = this.closest('.widget-step');
                        const errorDiv = step?.querySelector('.red-error');
                        if (errorDiv) {
                            errorDiv.style.display = 'block';
                        }
                    }
                }
            });
        });
    }
    
    // Override the original markStepCompleted to prevent auto-advance
    window.markStepCompleted = function(element) {
        const step = element.closest('.widget-step');
        if (!step) return;
        
        const stepNumber = parseInt(step.getAttribute('data-step'));
        
        // Check if step is completed
        let isCompleted = false;
        const stepType = step.getAttribute('data-type');
        
        if (stepType === 'input') {
            const inputs = step.querySelectorAll('input[data-step]');
            inputs.forEach(input => {
                if (input.value.trim() !== '') {
                    if (input.name === 'phone') {
                        if (!input.value.includes('_')) {
                            isCompleted = true;
                        }
                    } else {
                        isCompleted = true;
                    }
                }
            });
        } else if (stepType === 'radio') {
            const radios = step.querySelectorAll('input[type="radio"][data-step]');
            radios.forEach(radio => {
                if (radio.checked) {
                    isCompleted = true;
                }
            });
        } else if (stepType === 'stars') {
            const hiddenInput = step.querySelector('input[type="hidden"]');
            if (hiddenInput && hiddenInput.value !== '') {
                isCompleted = true;
            }
        } else if (stepType === 'bigcheckbox') {
            const checkboxes = step.querySelectorAll('input[type="checkbox"][data-step]');
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    isCompleted = true;
                }
            });
        } else if (stepType === 'consent') {
            const consentCheckbox = step.querySelector('input[type="checkbox"][data-step]');
            if (consentCheckbox && consentCheckbox.checked) {
                isCompleted = true;
            }
        }
        
        // Hide error if completed
        if (isCompleted) {
            const errorDiv = step.querySelector('.red-error');
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }
    };
    
    // Функция для отправки размера родительскому окну
    function sendHeightToParent() {
        if (window.parent !== window) {
            const height = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
            );
            
            window.parent.postMessage({
                type: 'warranty-form-resize',
                height: height
            }, '*');
        }
    }
    
    // Отправка размера при загрузке
    setTimeout(sendHeightToParent, 100);
    
    // Отправка размера при изменении содержимого
    const resizeObserver = new ResizeObserver(function() {
        sendHeightToParent();
    });
    
    resizeObserver.observe(document.body);
    
    // Отправка размера при изменении размера окна
    window.addEventListener('resize', function() {
        setTimeout(sendHeightToParent, 100);
    });
    
    // Отправка размера после загрузки всех ресурсов
    window.addEventListener('load', function() {
        setTimeout(sendHeightToParent, 200);
    });
    
    // Отправка размера при любых изменениях DOM (для динамического контента)
    const mutationObserver = new MutationObserver(function() {
        sendHeightToParent();
    });
    
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
    
    // Отправка размера при успешной отправке формы
    const originalShowSuccessMessage = window.showSuccessMessage;
    if (originalShowSuccessMessage) {
        window.showSuccessMessage = function() {
            originalShowSuccessMessage();
            setTimeout(sendHeightToParent, 100);
        };
    }
});
