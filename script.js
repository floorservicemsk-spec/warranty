// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize step navigation
    let currentStep = 1;
    const totalSteps = 6;
    
    // Activate first step
    activateStep(1);
    
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
    
    // Input validation for step completion
    initStepValidation();
    
    // Submit button control
    initSubmitButtonControl();
});

// Initialize phone mask
function initPhoneMask() {
    const phoneInput = document.getElementById('phone-input');
    if (phoneInput) {
        const phoneMask = IMask(phoneInput, {
            mask: '+{7} (000) 000-00-00',
            lazy: false,
            placeholderChar: '_'
        });
        
        // Проверка при потере фокуса
        phoneInput.addEventListener('blur', function() {
            const step = this.closest('.step');
            const errorDiv = step?.querySelector('.red-error');
            
            if (this.value.trim() !== '' && this.value.includes('_')) {
                // Номер заполнен не полностью
                this.classList.add('error');
                if (errorDiv) {
                    errorDiv.textContent = 'Пожалуйста, заполните номер телефона полностью';
                    errorDiv.style.display = 'block';
                }
            } else {
                this.classList.remove('error');
                if (errorDiv && !this.value.includes('_')) {
                    errorDiv.style.display = 'none';
                }
            }
        });
        
        // Убираем ошибку при вводе
        phoneInput.addEventListener('input', function() {
            if (!this.value.includes('_') && this.value.trim() !== '') {
                this.classList.remove('error');
                const step = this.closest('.step');
                const errorDiv = step?.querySelector('.red-error');
                if (errorDiv) {
                    errorDiv.style.display = 'none';
                }
            }
        });
    }
}

// Activate a specific step
function activateStep(stepNumber) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('step-active');
        
        if (stepNum === stepNumber) {
            step.classList.add('step-active');
        } else if (stepNum < stepNumber) {
            step.classList.add('step-good');
        }
    });
}

// Star rating functionality
function initStarRating() {
    const starContainers = document.querySelectorAll('.stars');
    
    starContainers.forEach(container => {
        const stars = container.querySelectorAll('.star');
        const input = container.querySelector('input[type="hidden"]');
        const step = container.closest('.step');
        const starsBad = step.querySelector('.stars-bad');
        const starsGood = step.querySelector('.stars-good');
        
        stars.forEach((star, index) => {
            // Hover effect
            star.addEventListener('mouseenter', function() {
                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.classList.add('hover-active');
                    } else {
                        s.classList.remove('hover-active');
                    }
                });
            });
            
            // Click to select
            star.addEventListener('click', function() {
                const rating = star.getAttribute('data-star');
                input.value = rating;
                
                // Remove all active classes
                stars.forEach(s => {
                    s.classList.remove('active');
                    s.classList.remove('hover-active');
                });
                
                // Add active class to selected stars
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('active');
                    }
                });
                
                // Show feedback section based on rating
                if (rating <= 3) {
                    if (starsBad) starsBad.style.display = 'block';
                    if (starsGood) starsGood.style.display = 'none';
                } else if (rating == 5) {
                    // Only show Yandex review for 5 stars
                    if (starsBad) starsBad.style.display = 'none';
                    if (starsGood) starsGood.style.display = 'block';
                } else {
                    // For 4 stars - hide both
                    if (starsBad) starsBad.style.display = 'none';
                    if (starsGood) starsGood.style.display = 'none';
                }
                
                // Mark step as completed and move to next
                markStepCompleted(star);
            });
        });
        
        // Reset hover on mouse leave
        container.addEventListener('mouseleave', function() {
            stars.forEach(s => {
                s.classList.remove('hover-active');
            });
        });
    });
}

// Additional work radio functionality
function initAdditionalWork() {
    const radios = document.querySelectorAll('input[name="additional_work"]');
    const dopsTextarea = document.querySelector('.dops-textarea[data-val="Да"]');
    
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Да' && this.checked) {
                if (dopsTextarea) {
                    dopsTextarea.style.display = 'block';
                }
            } else if (this.value === 'Нет' && this.checked) {
                if (dopsTextarea) {
                    dopsTextarea.style.display = 'none';
                }
                markStepCompleted(this);
            }
        });
    });
}

// Dynamic textarea addition/removal
function initDynamicTextareas() {
    const dopsAdd = document.querySelector('.dop-add');
    const dopsTextarea = document.querySelector('.dops-textarea');
    
    if (dopsAdd && dopsTextarea) {
        dopsAdd.addEventListener('click', function() {
            const lines = dopsTextarea.querySelectorAll('.line-textarea');
            const newIndex = lines.length + 1;
            const firstLine = lines[0];
            const newLine = firstLine.cloneNode(true);
            
            // Clear textarea values
            const textareas = newLine.querySelectorAll('textarea');
            textareas.forEach(textarea => {
                textarea.value = '';
            });
            
            // Update data-i attribute
            newLine.setAttribute('data-i', newIndex);
            
            // Insert before the add button container
            const dopsAddContainer = dopsTextarea.querySelector('.dops-add');
            dopsAddContainer.parentNode.insertBefore(newLine, dopsAddContainer);
            
            // Initialize remove button for new line
            initRemoveButtons();
        });
    }
    
    // Initialize remove buttons
    initRemoveButtons();
}

function initRemoveButtons() {
    const removeButtons = document.querySelectorAll('.dop-remove');
    
    removeButtons.forEach(button => {
        button.onclick = function() {
            const line = this.closest('.line-textarea');
            const parent = line.parentElement;
            const lines = parent.querySelectorAll('.line-textarea');
            
            // Only remove if there's more than one line
            if (lines.length > 1) {
                line.remove();
            }
        };
    });
}

// Step validation
function initStepValidation() {
    // Monitor all inputs, radios, checkboxes
    const allInputs = document.querySelectorAll('input[data-step], textarea');
    
    allInputs.forEach(input => {
        input.addEventListener('change', function() {
            markStepCompleted(this);
        });
        
        input.addEventListener('input', function() {
            if (this.type === 'text' || this.type === 'textarea') {
                markStepCompleted(this);
            }
        });
    });
}

function markStepCompleted(element) {
    const step = element.closest('.step');
    if (!step) return;
    
    const stepNumber = parseInt(step.getAttribute('data-step'));
    const stepType = step.getAttribute('data-type');
    
    // Check if step is completed
    let isCompleted = false;
    
    if (stepType === 'input') {
        // Check if at least one input has value
        const inputs = step.querySelectorAll('input[data-step]');
        inputs.forEach(input => {
            if (input.value.trim() !== '') {
                // Для телефона проверяем, что все цифры заполнены (нет символов _)
                if (input.name === 'phone') {
                    // Проверяем, что нет незаполненных позиций маски (_)
                    if (!input.value.includes('_')) {
                        isCompleted = true;
                    }
                } else {
                    isCompleted = true;
                }
            }
        });
    } else if (stepType === 'radio') {
        // Check if radio is selected
        const radios = step.querySelectorAll('input[type="radio"][data-step]');
        radios.forEach(radio => {
            if (radio.checked) {
                isCompleted = true;
            }
        });
    } else if (stepType === 'stars') {
        // Check if rating is given
        const hiddenInput = step.querySelector('input[type="hidden"]');
        if (hiddenInput && hiddenInput.value !== '') {
            isCompleted = true;
        }
    } else if (stepType === 'bigcheckbox') {
        // Check if at least one checkbox is selected
        const checkboxes = step.querySelectorAll('input[type="checkbox"][data-step]');
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                isCompleted = true;
            }
        });
    }
    
    // Hide error if completed
    if (isCompleted) {
        const errorDiv = step.querySelector('.red-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        
        // Move to next step
        if (stepNumber < 6) {
            setTimeout(() => {
                activateStep(stepNumber + 1);
            }, 300);
        }
    }
}

// Form submission
function initFormSubmission() {
    const form = document.getElementById('warrantyForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check consent checkbox
        const consentCheckbox = document.getElementById('consent');
        if (!consentCheckbox.checked) {
            alert('Пожалуйста, дайте согласие на обработку персональных данных');
            consentCheckbox.focus();
            return;
        }
        
        // Validate all steps
        let allValid = true;
        const steps = document.querySelectorAll('.step');
        
        steps.forEach(step => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            const stepType = step.getAttribute('data-type');
            const errorDiv = step.querySelector('.red-error');
            let isValid = false;
            
            if (stepType === 'input') {
                const inputs = step.querySelectorAll('input[data-step]');
                inputs.forEach(input => {
                    if (input.value.trim() !== '') {
                        // Для телефона проверяем полноту заполнения
                        if (input.name === 'phone') {
                            // Если телефон заполнен И все цифры введены (нет _)
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
            }
            
            if (!isValid) {
                allValid = false;
                if (errorDiv) {
                    errorDiv.style.display = 'block';
                }
                step.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                if (errorDiv) {
                    errorDiv.style.display = 'none';
                }
            }
        });
        
        if (allValid) {
            // All steps are valid, submit form via AJAX
            submitFormData(form);
        }
    });
}

function submitFormData(form) {
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Показываем индикатор загрузки
    submitButton.disabled = true;
    submitButton.innerHTML = '<span>ОТПРАВКА...</span>';
    
    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccessMessage();
        } else {
            alert(data.message || 'Произошла ошибка при отправке формы');
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Произошла ошибка при отправке формы. Попробуйте позже.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    });
}

function showSuccessMessage() {
    const form = document.querySelector('form');
    const endMessage = document.querySelector('.end');
    
    // Hide form with animation
    form.style.transition = 'opacity 0.5s ease';
    form.style.opacity = '0';
    
    setTimeout(() => {
        form.style.display = 'none';
        endMessage.style.display = 'block';
        endMessage.style.opacity = '0';
        
        setTimeout(() => {
            endMessage.style.transition = 'opacity 0.5s ease';
            endMessage.style.opacity = '1';
        }, 100);
    }, 500);
}

// Submit button control based on consent checkbox
function initSubmitButtonControl() {
    const consentCheckbox = document.getElementById('consent');
    const submitButton = document.getElementById('submit-btn');
    
    if (consentCheckbox && submitButton) {
        // Initial state is disabled (set in HTML)
        
        consentCheckbox.addEventListener('change', function() {
            if (this.checked) {
                submitButton.disabled = false;
            } else {
                submitButton.disabled = true;
            }
        });
    }
}

// "Nothing needed" checkbox functionality
document.addEventListener('change', function(e) {
    if (e.target.id === 'nothing-needed') {
        const checkboxes = document.querySelectorAll('input[name="discounts[]"]:not(#nothing-needed)');
        if (e.target.checked) {
            // Uncheck all other options when "Nothing needed" is selected
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
        markStepCompleted(e.target);
    }
    
    if (e.target.name === 'discounts[]' && e.target.id !== 'nothing-needed') {
        const nothingCheckbox = document.querySelector('#nothing-needed');
        if (e.target.checked && nothingCheckbox) {
            // Uncheck "Nothing needed" when any product is selected
            nothingCheckbox.checked = false;
        }
        markStepCompleted(e.target);
    }
});

