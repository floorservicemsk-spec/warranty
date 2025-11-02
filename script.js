// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация маски для телефона
    const phoneInput = document.getElementById('phone-input');
    if (phoneInput && typeof IMask !== 'undefined') {
        const phoneMask = IMask(phoneInput, {
            mask: '+{7} (000) 000-00-00',
            lazy: false
        });
    }

    // Текущий активный шаг
    let currentStep = 1;
    const totalSteps = 6;

    // Инициализация первого шага
    showStep(1);

    // Обработка изменения полей ввода (шаг 1)
    const phoneField = document.getElementById('phone-input');
    const contractField = document.querySelector('input[name="contract"]');
    
    if (phoneField) {
        phoneField.addEventListener('input', function() {
            if (this.value.trim()) {
                markStepComplete(1);
            } else if (!contractField || !contractField.value.trim()) {
                markStepIncomplete(1);
            }
        });
    }

    if (contractField) {
        contractField.addEventListener('input', function() {
            if (this.value.trim()) {
                markStepComplete(1);
            } else if (!phoneField || !phoneField.value.trim()) {
                markStepIncomplete(1);
            }
        });
    }

    // Обработка радиокнопок (шаг 2)
    const additionalWorkRadios = document.querySelectorAll('input[name="additional_work"]');
    additionalWorkRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            markStepComplete(2);
            if (this.value === 'Да') {
                showAdditionalWorkFields();
            } else {
                hideAdditionalWorkFields();
            }
        });
    });

    // Обработка звездных рейтингов (шаги 3, 4, 5)
    setupStarRatings('sales', 3);
    setupStarRatings('delivery', 4);
    setupStarRatings('installation', 5);

    // Обработка чекбоксов скидок (шаг 6)
    const discountCheckboxes = document.querySelectorAll('input[name="discounts[]"]');
    const nothingNeededCheckbox = document.getElementById('nothing-needed');
    
    discountCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.id === 'nothing-needed' && this.checked) {
                // Если выбрано "Ничего не нужно", снимаем остальные чекбоксы
                discountCheckboxes.forEach(cb => {
                    if (cb.id !== 'nothing-needed') {
                        cb.checked = false;
                    }
                });
            } else if (this.id !== 'nothing-needed' && this.checked) {
                // Если выбрана любая скидка, снимаем "Ничего не нужно"
                if (nothingNeededCheckbox) {
                    nothingNeededCheckbox.checked = false;
                }
            }
            markStepComplete(6);
        });
    });

    // Обработка согласия на обработку данных
    const consentCheckbox = document.getElementById('consent');
    const submitBtn = document.getElementById('submit-btn');
    
    if (consentCheckbox && submitBtn) {
        consentCheckbox.addEventListener('change', function() {
            if (this.checked && allStepsComplete()) {
                submitBtn.disabled = false;
            } else {
                submitBtn.disabled = true;
            }
        });
    }

    // Обработка добавления дополнительных работ
    const addWorkBtn = document.querySelector('.dop-add');
    if (addWorkBtn) {
        addWorkBtn.addEventListener('click', function() {
            addWorkRow();
        });
    }

    // Обработка удаления дополнительных работ
    document.addEventListener('click', function(e) {
        if (e.target.closest('.dop-remove')) {
            const row = e.target.closest('.line-textarea');
            if (row) {
                row.remove();
            }
        }
    });

    // Обработка отправки формы
    const warrantyForm = document.getElementById('warrantyForm');
    if (warrantyForm) {
        warrantyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitForm();
        });
    }

    // Функция показа шага
    function showStep(step) {
        const steps = document.querySelectorAll('.step');
        steps.forEach((s, index) => {
            if (index + 1 === step) {
                s.classList.add('step-active');
                s.classList.remove('step-good');
            } else if (index + 1 < step) {
                s.classList.remove('step-active');
                s.classList.add('step-good');
            } else {
                s.classList.remove('step-active', 'step-good');
            }
        });
        currentStep = step;
    }

    // Функция пометки шага как завершенного
    function markStepComplete(step) {
        const stepElement = document.querySelector(`.step[data-step="${step}"]`);
        if (stepElement) {
            stepElement.classList.add('step-good');
            stepElement.classList.remove('step-active');
            
            // Показываем следующий шаг
            if (step < totalSteps) {
                const nextStep = step + 1;
                const nextStepElement = document.querySelector(`.step[data-step="${nextStep}"]`);
                if (nextStepElement && !nextStepElement.classList.contains('step-good')) {
                    showStep(nextStep);
                }
            }
        }

        // Проверяем, можно ли активировать кнопку отправки
        if (consentCheckbox && consentCheckbox.checked && allStepsComplete()) {
            submitBtn.disabled = false;
        }
    }

    // Функция пометки шага как незавершенного
    function markStepIncomplete(step) {
        const stepElement = document.querySelector(`.step[data-step="${step}"]`);
        if (stepElement) {
            stepElement.classList.remove('step-good');
            if (step === currentStep) {
                stepElement.classList.add('step-active');
            }
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
        }
    }

    // Функция настройки звездных рейтингов
    function setupStarRatings(ratingType, step) {
        const starsContainer = document.querySelector(`.stars[data-rating="${ratingType}"]`);
        if (!starsContainer) return;

        const stars = starsContainer.querySelectorAll('.star');
        const hiddenInput = starsContainer.querySelector('input[type="hidden"]');
        const stepElement = document.querySelector(`.step[data-step="${step}"]`);
        const starsBad = stepElement.querySelector('.stars-bad');
        const starsGood = stepElement.querySelector('.stars-good');

        let selectedRating = 0;

        stars.forEach((star, index) => {
            const rating = index + 1;

            star.addEventListener('click', function() {
                selectedRating = rating;
                hiddenInput.value = rating;

                // Обновляем визуальное состояние звезд
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('active');
                        s.classList.remove('hover-active');
                    } else {
                        s.classList.remove('active', 'hover-active');
                    }
                });

                // Показываем/скрываем поля обратной связи
                if (starsBad && starsGood) {
                    if (rating < 4) {
                        starsBad.style.display = 'block';
                        starsGood.style.display = 'none';
                    } else {
                        starsBad.style.display = 'none';
                        starsGood.style.display = 'block';
                    }
                }

                markStepComplete(step);
            });

            star.addEventListener('mouseenter', function() {
                if (selectedRating === 0) {
                    stars.forEach((s, i) => {
                        if (i < rating) {
                            s.classList.add('hover-active');
                        } else {
                            s.classList.remove('hover-active');
                        }
                    });
                }
            });
        });

        starsContainer.addEventListener('mouseleave', function() {
            if (selectedRating === 0) {
                stars.forEach(s => s.classList.remove('hover-active'));
            } else {
                stars.forEach((s, i) => {
                    if (i < selectedRating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active', 'hover-active');
                    }
                });
            }
        });
    }

    // Функция показа полей дополнительных работ
    function showAdditionalWorkFields() {
        const dopsTextarea = document.querySelector('.dops-textarea[data-val="Да"]');
        if (dopsTextarea) {
            dopsTextarea.style.display = 'block';
        }
    }

    // Функция скрытия полей дополнительных работ
    function hideAdditionalWorkFields() {
        const dopsTextarea = document.querySelector('.dops-textarea[data-val="Да"]');
        if (dopsTextarea) {
            dopsTextarea.style.display = 'none';
        }
    }

    // Функция добавления строки дополнительной работы
    function addWorkRow() {
        const dopsTextarea = document.querySelector('.dops-textarea[data-val="Да"]');
        if (!dopsTextarea) return;

        const dopsAdd = dopsTextarea.querySelector('.dops-add');
        if (!dopsAdd) return;

        const newRow = document.createElement('div');
        newRow.className = 'line-textarea';
        newRow.setAttribute('data-i', Date.now());

        newRow.innerHTML = `
            <div class="dop-textarea">
                <textarea name="work_description[]" placeholder="Напишите, какие дополнительные работы были выполнены"></textarea>
            </div>
            <div class="dop-textarea">
                <textarea name="work_cost[]" placeholder="Стоимость работ (руб.)"></textarea>
            </div>
            <div class="dop-remove">
                <svg height="329pt" viewBox="0 0 329.26933 329" width="329pt" xmlns="http://www.w3.org/2000/svg">
                    <path d="m194.800781 164.769531 128.210938-128.214843c8.34375-8.339844 8.34375-21.824219 0-30.164063-8.339844-8.339844-21.824219-8.339844-30.164063 0l-128.214844 128.214844-128.210937-128.214844c-8.34375-8.339844-21.824219-8.339844-30.164063 0-8.34375 8.339844-8.34375 21.824219 0 30.164063l128.210938 128.214843-128.210938 128.214844c-8.34375 8.339844-8.34375 21.824219 0 30.164063 4.15625 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921875-2.089844 15.082031-6.25l128.210937-128.214844 128.214844 128.214844c4.160156 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921874-2.089844 15.082031-6.25 8.34375-8.339844 8.34375-21.824219 0-30.164063zm0 0"/>
                </svg>
            </div>
        `;

        dopsTextarea.insertBefore(newRow, dopsAdd);
    }

    // Функция проверки, все ли шаги завершены
    function allStepsComplete() {
        // Проверка шага 1
        const phone = phoneField ? phoneField.value.trim() : '';
        const contract = contractField ? contractField.value.trim() : '';
        if (!phone && !contract) return false;

        // Проверка шага 2
        const additionalWork = document.querySelector('input[name="additional_work"]:checked');
        if (!additionalWork) return false;

        // Проверка шагов 3, 4, 5 (рейтинги)
        const salesRatingInput = document.querySelector('input[name="sales_rating"]');
        const deliveryRatingInput = document.querySelector('input[name="delivery_rating"]');
        const installationRatingInput = document.querySelector('input[name="installation_rating"]');
        
        if (!salesRatingInput || !salesRatingInput.value || salesRatingInput.value === '0') return false;
        if (!deliveryRatingInput || !deliveryRatingInput.value || deliveryRatingInput.value === '0') return false;
        if (!installationRatingInput || !installationRatingInput.value || installationRatingInput.value === '0') return false;

        // Шаг 6 не обязателен (скидки), но можно проверить, что хотя бы один чекбокс выбран
        // Но согласно логике формы, шаг 6 не обязателен, поэтому пропускаем

        return true;
    }

    // Функция показа ошибки валидации
    function showError(step, message) {
        const stepElement = document.querySelector(`.step[data-step="${step}"]`);
        if (stepElement) {
            const errorElement = stepElement.querySelector('.red-error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        }
    }

    // Функция скрытия ошибки валидации
    function hideError(step) {
        const stepElement = document.querySelector(`.step[data-step="${step}"]`);
        if (stepElement) {
            const errorElement = stepElement.querySelector('.red-error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
    }

    // Функция отправки формы
    function submitForm() {
        if (!allStepsComplete()) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        if (!consentCheckbox || !consentCheckbox.checked) {
            alert('Необходимо согласие на обработку персональных данных');
            return;
        }

        // Блокируем кнопку отправки
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>ОТПРАВКА...</span>';
        }

        // Получаем данные формы
        const formData = new FormData(warrantyForm);

        // Отправляем запрос
        fetch('send-warranty.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Показываем сообщение об успехе
                warrantyForm.style.display = 'none';
                const endMessage = document.querySelector('.end');
                if (endMessage) {
                    endMessage.style.display = 'block';
                }
            } else {
                alert(data.message || 'Произошла ошибка при отправке формы');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>АКТИВИРОВАТЬ ГАРАНТИЮ</span>';
                }
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при отправке формы. Попробуйте позже.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>АКТИВИРОВАТЬ ГАРАНТИЮ</span>';
            }
        });
    }
});
