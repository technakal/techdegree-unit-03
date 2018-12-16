/*****************************************
  PAGE LOAD FUNCTIONS
*****************************************/

/**
 * Set up the page for JavaScript enhancements.
 * Remove HTML validation and "required" field attributes, as this will be handled by JavaScript.
 * Set event handlers.
 */
$('document').ready(function() {
  $('#name').focus();
  // remove HTML-only validation
  $('#name').removeAttr('required');
  $('#mail').removeAttr('required');
  $('#mail').attr('type', 'text');
  // hide fields until needed
  $('#other-title-group').hide();
  $('#shirt-colors').hide().find('#color').empty();
  $('option[value=select_method]').remove();
  $('#paypal-message').hide();
  $('#bitcoin-message').hide();
  // add event listeners
  $('#name').on('blur keyup', (event) => {
    if(event.keyCode !== 9) {
      validateInputExists('name');
    }
  });
  $('#mail').on('blur keyup', (event) => {
    if(event.keyCode !== 9) {
      validateEmail('mail');
    }
  });
  $('#other-title').on('blur keyup', (event) => {
    if(event.keyCode !== 9) {
      validateInputExists('other-title');
    }
  });
  $('#title').on('change', () => checkJobRole());
  $('#design').on('change', () => setShirtDesign());
  $('.activities').on('change', event => selectActivity(event.target));
  $('#payment').on('change', event => selectPaymentType(event));
  $('#cc-num').attr('maxlength', 16).on('blur keyup', (event) => {
    if(event.keyCode !== 9) {
      validateCreditCard()
    }
  });
  $('#zip').attr('maxlength', 5).on('blur keyup', (event) => {
    if(event.keyCode !== 9) {
      validateZipCode()
    }
  });
  $('#cvv').attr('maxlength', 3).on('blur keyup', (event) => {
    if(event.keyCode !== 9) {
      validateCVV()
    }
  });
  $('#exp-year').on('change', event => validateExpirationDate());
  $('#exp-month').on('change', event => validateExpirationDate());
  $('form').submit(event => submitForm(event));
});

/*****************************************
  OTHER JOB ROLES
*****************************************/

/**
 * Checks if the job role is set to other. If so, shows the Other inputs. If not, makes sure the Other inputs are hidden.
 */  
const checkJobRole = () => {
  if($(`#title`).val() == 'other') {
    $('#other-title-group').slideDown();
  } else {
    $('#other-title-group').slideUp();
  }
}

/*****************************************
  SHIRT SELECTION
*****************************************/

/**
 * Sets the shirt design and shows available colors related to that design.
 */
const setShirtDesign = () => {
  $(`#design option[value=default]`).remove();
  $('#shirt-colors').slideDown();
  const jsPuns = `
    <option value="cornflowerblue">Cornflower Blue</option>
    <option value="darkslategrey">Dark Slate Grey</option>
    <option value="gold">Gold</option>
  `;
  const heartJS = `
    <option value="tomato">Tomato</option>
    <option value="steelblue">Steel Blue</option>
    <option value="dimgrey">Dim Grey</option>
  `;
  $(`#design`).val() == 'js puns'
    ? $('#color').html(jsPuns)
    : $('#color').html(heartJS);
}

/*****************************************
  ACTIVITY ENTRY
*****************************************/

/**
 * Disables conflicting activities based on time and date. Adds the activity cost to the total cost.
 * @param {element} target - The selected activty.
 */
const selectActivity = (target) => {
  const labels = $('.activities label');
  if(target.name !== 'all') {
    const label = $(`[name=${target.name}]`).parent().text();
    const timeRegex = /\w+[day]\s(\d+)(am|pm)-(\d+)(am|pm)/i;
    const time = label.match(timeRegex)[0];
    labels.each(function(index, value) {
      if(label !== value.textContent && index !== 0) {
        const input = $(labels[index]).find('input');
        const sibTime = value.textContent.match(timeRegex)[0];
        const sameTime = testConferenceTime(time, sibTime);
        if(sameTime) {
          toggleDisabled(input);
        }
      } 
    });
  }
  let totalPrice = 0;
  $('.activities label input').each(function() {
    if(this.checked) {
      totalPrice += calculatePrice(this);
    }
  });
  displayPrice(totalPrice);
  validateActivitySelected();
}

/**
 * Compares the time of the selected event to the time of the sibling event. Returns boolean.
 * @param {string} time - Time of the selected event. Date and time string, in the format "[Day] [start][am/pm]-[end][am/pm]".
 * @param {string} sibTime - Time of the sibling event. Date and time string, in the format "[Day] [start][am/pm]-[end][am/pm]".
 */
const testConferenceTime = (time, sibTime) => {
  return time == sibTime;
}

/**
 * Toggles the disabled status of the passed input. If disabled, enable. If not, disable.
 * @param {element} input - An HTML input, to be toggled.
 */
const toggleDisabled = input => {
  if($(input).attr('disabled')) {
    $(input).removeAttr('disabled');
  } else {
    $(input).attr('disabled', true);
  }
}

/**
 * Parses the passed activity's parent label to determine price.
 * @param {element} activity - The selected activity element
 */
const calculatePrice = activity => {
  const priceRegex = /\$(\d+)/i;
  const price = Number($(activity).parent().text().match(priceRegex)[1]);
  return price;
}

/**
 * Displays the total cost of all selected activities.
 * @param {integer} price - The total cost of all selected activities.
 */
const displayPrice = price => {
  if($('#total-price').text()) {
    $('#total-price').text(`Total: $ ${price}.00`);
  } else {
    $('.activities').append(`<h2 id="total-price">Total: $ ${price}.00</h2>`);
    $('#total-price').hide().slideDown();
  }
}

/*****************************************
  PAYMENT ENTRY
*****************************************/

/**
 * Sets the payment type. 
 * If credit card, show all credit card fields, add event listeners, and hide all other types.
 * If bitcoin or paypal, remove all credit card validation, hide credit card inputs, and display the appropriate message.
 * @param {event} event - The triggering event. Selecting one of the payment types from the menu.
 */
const selectPaymentType = event => {
  const paymentType = $(event.target).val();
  if(paymentType == 'credit card') {
    $('#bitcoin-message').slideUp();
    $('#paypal-message').slideUp();
    $('#credit-card').slideDown();
  } else if(paymentType == 'bitcoin') {
    $('#bitcoin-message').slideDown();
    $('#paypal-message').slideUp();
    $('#credit-card').slideUp();
  } else {
    $('#bitcoin-message').slideUp();
    $('#paypal-message').slideDown();
    $('#credit-card').slideUp();
  }
}

/*****************************************
  VALIDATION
*****************************************/

/**
 * Checks to make sure something is entered in the field.
 * Used for Name and Other Role inputs.
 * Appends and updates errors for the passed id, as needed.
 * @param {string} id - The identifier of the element to be checked.
 */
const validateInputExists = id => {
  const { isEmpty, hasError } = runCommonValidation(id);
  if(isEmpty) {
    displayError(id, getEmptyMessage(), hasError);
    $(`#${id}`).addClass('error');
  }
  if(!isEmpty && hasError) {
    removeError(id);
    $(`#${id}`).removeClass('error');
  }
  return !isEmpty;
}

/**
 * Validates the email field.
 * Checks for blank value.
 * Checks against regex.
 * Appends and updates errors for the email field, as needed.
 */
const validateEmail = () => {
  const { isEmpty, hasError } = runCommonValidation('mail');
  const emailRegex = /^([^@])+(@)([^@])+\.([^@])+$/im
  const isValid = emailRegex.test($(`#mail`).val());
  const message = isEmpty ? getEmptyMessage() : `We've seen a lot of email addresses. That's not one.`;
  if(!isValid) {
    displayError('mail', message, hasError);
    $('#mail').addClass('error');
  } else {
    removeError('mail');
    $('#mail').removeClass('error');
  }
  return isValid;
}

/**
 * Checks that at least one Activity is selected.
 * If not, displays an error message.
 */
const validateActivitySelected = () => {
  const hasError = $(`#activities-error`).length > 0;
  const activities = $(`.activities label input`);
  const selectedActivities = []
  activities.each(function() {
    selectedActivities.push(this.checked);
  });
  if(!selectedActivities.includes(true)) {
    displayError('activities', `You have to select an activity. Otherwise, what's the point?`, hasError);
  } else {
    removeError('activities');
  }
  return selectedActivities.includes(true);
}

/**
 * Verifies that the credit card number isn't empty or outside of the acceptable length range: 13 to 19 numeric characters.
 * Returns boolean.
 */
const validateCreditCard = () => {
  const { isEmpty, hasError } = runCommonValidation('cc-num');
  const creditRegex = /\d{13,16}/i;
  const isValid = creditRegex.test($('#cc-num').val());
  const message = isEmpty ? `REQUIRED` : `INVALID`;
  if(!isValid) {
    $('#cc-num').addClass('error')
    $('#cc-num').prev().html(`Card Number: <span style="color: #D3343E; font-size: 0.85rem">${message}</span>`);
  } else {
    $('#cc-num').removeClass('error')
    $('#cc-num').prev().html(`Card Number:`);
  }
  return isValid;
}

/**
 * Verifies that the zip code isn't empty.
 * Verifies that the zip code matches the expected format.
 * Returns boolean.
 */
const validateZipCode = () => {
  const { isEmpty, hasError } = runCommonValidation('zip');
  const zipRegex = /^\d{5}$/i;
  const isValid = zipRegex.test($('#zip').val());
  const message = isEmpty ? `REQUIRED` : `INVALID`;
  if(!isValid) {
    $('#zip').addClass('error')
    $('#zip').prev().html(`Zip Code: <span style="color: #D3343E; font-size: 0.85rem">${message}</span>`);
  } else {
    $('#zip').removeClass('error')
    $('#zip').prev().html(`Zip Code:`);
  }
  return isValid;
}

/**
 * Verifies that the CVV isn't empty or greater than 3 numeric characters long.
 * Returns boolean.
 */
const validateCVV = () => {
  const { isEmpty, hasError } = runCommonValidation('cvv');
  const cvvRegex = /^\d{3}$/i;
  const isValid = cvvRegex.test($('#cvv').val());
  const message = isEmpty ? `REQUIRED` : `INVALID`;
  if(!isValid) {
    $('#cvv').addClass('error').prev().html(`CVV: <span style="color: #D3343E; font-size: 0.85rem">${message}</span>`);
  } else {
    $('#cvv').removeClass('error').prev().html(`CVV:`);
  }
  return isValid;
}

/**
 * Verifies that the credit card is not expired.
 * Returns boolean.
 */
const validateExpirationDate = () => {
  const { isEmpty, hasError } = runCommonValidation('exp-year');
  const d = new Date();
  const today = {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
  }

  const expYear = $('#exp-year').val();
  const expMonth = $('#exp-month').val();
  
  if(expYear < today.year) {
    displayError('exp-year', `Your card is expired.`, hasError);
    return false;
  }
  if(expYear == today.year) {
    if(expMonth < today.month) {
      displayError('exp-year', `Your card is expired.`, hasError);
      return false;
    }
  }
  removeError('exp-year');
  return true;
}

/*****************************************
 VALIDATION HELPERS
*****************************************/

/**
 * Runs some common validation checks and returns the outcome of each.
 * Checks if the input is empty.
 * Checks if the input already has an error element associated with it.
 * Returns an object.
 * @param {string} id - The identifier of the element to be checked.
 */
const runCommonValidation = (id) => {
  return { 
    isEmpty: checkIfEmpty(id), 
    hasError: checkForErrorElement(id) 
  };
}

/**
 * Checks to see if the value of the element at id is blank. 
 * Returns a boolean.
 * @param {string} id - The identifier of the element to be checked.
 */
const checkIfEmpty = id => {
  return $(`#${id}`).val().length == 0;
}

/**
 * Checks to see if the element at id-error already exists.
 * Returns a boolean.
 * @param {string} id  - The identifier of the element to be checked.
 */
const checkForErrorElement = id => {
  return $(`#${id}-error`).length > 0;
}

/*****************************************
 ERROR HANDLING
*****************************************/

/**
 * Returns a random error message related to the empty status. To keep things fresh.
 */
const getEmptyMessage = () => {
  const emptyMessages = [
    `Can't leave this one blank.`,
    `You gotta fill this one in, buddy.`,
    `Not so fast, pal. Can't leave this blank.`,
    `Please enter your information here.`,
    `Not everything is required. But this one is.`
  ];
  return emptyMessages[getRandom(0, emptyMessages.length)];
}

/**
 * Creates and returns the error element.
 * @param {string} id - The id of the element to which the error applies.
 * @param {string} message - The text of the message to be displayed.
 */
const createErrorElement = (id, message) => {
  return `<p id="${id}-error" class="error-message">${message}</p>`;
}

/**
 * Removes the error with the passed id from the DOM.
 * @param {string} id - The identifier of the error to be removed.
 */
const removeError = id => {
  return $(`#${id}-error`).remove();
}

/**
 * Determines whether a new error needs to be created, or an existing error needs to be updated with the message.
 * If the error already exists, just updates the message to reflect the most recent error.
 * Otherwise, creates the error and adds it to the DOM.
 * @param {string} id - The id of the element to which the error applies.
 * @param {string} message - The text of the message to be displayed.
 * @param {boolean} exists - Indicates whether the error element for the passed id already exists in the DOM.
 */
const displayError = (id, message, exists = false) => {
  if(exists) {
    return $(`#${id}-error`).text(message);
  }
  if(id == 'activities') {
    return $('.activities').after(createErrorElement('activities', message));
  }
  return $(`#${id}`).after(createErrorElement(id, message));
}

/*****************************************
 SUBMISSION
*****************************************/
  
/**
 * Processes final validation checks to ensure entry is acceptable.
 * If so, submits form, displays message, and resets form.
 * @param {event} event - The triggering event. Submission of the form.
 */
const submitForm = event => {
  event.preventDefault();
  const entryIsValid = {}
  entryIsValid.nameIsEntered = validateInputExists('name');
  entryIsValid.emailIsValid = validateEmail();
  if($('#title').val() == 'other') {
    entryIsValid.otherRoleEntered = validateInputExists('other-title');
  }
  entryIsValid.activityIsSelected = validateActivitySelected();
  if($('#payment').val() == 'credit card') {
    entryIsValid.ccNumValid = validateCreditCard();
    entryIsValid.zipCodeValid = validateZipCode();
    entryIsValid.cvvValid = validateCVV();
    entryIsValid.expDateValid = validateExpirationDate();
  }

  // Pull the validatino list and determine how inputs failed validation.
  const entries = Object.values(entryIsValid);
  let numberOfErrors = 0;
  for (const entry of entries) {
    if(!entry) {
      numberOfErrors++;
    }
  }

  // display the number of errors so they user knows what's happening (in case an error is off-screen).
  displaySubmitError(numberOfErrors);

  // if there are no errors, process submission.
  if(!Object.values(entryIsValid).includes(false)) {
    if($('.submit-error').length > 0) {
      $('.submit-error').remove();
    }
    displaySuccess();
    setTimeout(function() {
      $('.success-message').remove();
      $('#total-price').remove();
      $('#other-title-group').hide();
      $('#other-title').removeClass('error');
      if($('#design option[value=default]').length == 0) {
        $('#design').prepend('<option value="default">Select Theme</option>');
      }
      $('#design option[value=default]').attr('selected', true);
      $('#shirt-colors').hide().find('#color').empty();
      $('.activities label input').each(function() {
        $(this).removeAttr('disabled');
      });
      $('#credit-card').show().find('input').removeClass('error');
      $('#cc-num').prev().html(`Card Number:`);
      $('#zip').prev().html(`Zip Code:`);
      $('#cvv').prev().html(`CVV:`);
      $('#paypal-message').hide();
      $('#bitcoin-message').hide();
      $('.error-message').remove();
      $('form').trigger('reset');
      window.scrollTo(0,0);
      $('#name').focus();
    }, 2500);
  };
}

/**
 * Displays an error message with the number of errors that need to be addressed.
 * @param {integer} numberOfErrors - The number of errors in the form.
 */
const displaySubmitError = numberOfErrors => {
  const hasError = $('.submit-error').length > 0;
  if(numberOfErrors > 0) {
    if(hasError) {
      $('.submit-error').html(`<p class="submit-error">You must correct <strong>${numberOfErrors}</strong> ${numberOfErrors > 1 ? 'errors' : 'error'} before submitting.</p>`);
      return;
    }
    $('button').after(`<p class="submit-error">You must correct <strong>${numberOfErrors}</strong> ${numberOfErrors > 1 ? 'errors' : 'error'} before submitting.</p>`);
    return;
  }
}

/**
 * Displays a success message when the form is submitted... successfully.
 */
const displaySuccess = () => {
  const priceRegex = /(\$)\s(\d+\.\d{2})+/
  const total = $('#total-price').text().match(priceRegex)[2];
  $('button').after(`<p class="success-message">Congrats! You're registered. <span class="small-message">Also, we charged you $${total}.</span></p>`);
  $('.success-message').hide().delay(200).slideDown();
}

/*****************************************
 HELPER FUNCTIONS
*****************************************/

const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
}