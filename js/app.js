const nameInput = $('#name');
const emailInput = $('#mail');
const otherTitleLabel = $('#other-title').prev();
const otherTitleInput = $('#other-title');
const shirtColor = $('#shirt-colors');
const creditCardEntry = $('#credit-card');
const paypalMessage = $('#paypal-message');
const bitcoinMessage = $('#bitcoin-message');
const submitButton = $('button');

/* Focus on Name Field
  The Registration_Form shall focus on the Name_Input at page load. */

$('document').ready(function() {
  nameInput.focus();
  // remove HTML-only validation
  nameInput.removeAttr('required');
  emailInput.removeAttr('pattern');
  emailInput.removeAttr('required');
  // hide fields until needed
  otherTitleLabel.hide();
  otherTitleInput.hide();
  $('#color').empty();
  shirtColor.hide();
  $('option[value=select_method]').remove();
  paypalMessage.hide();
  bitcoinMessage.hide();
  // add event listeners
  $('#title').on('change', event => checkJobRole(event));
  $('#design').on('change', event => setShirtDesign(event));
  $('.activities').on('change', event => selectActivity(event));
  $('#payment').on('change', event => selectPaymentType(event));
});

/* Other Job Roles
  The Registration_Form shall allow the user to enter Other_Roles into the Registration_Form. Must use ID of "other-title". Must use placeholder of "Your Job Role".
  When the user selects the Other option in Job_Roles, the Registration_Form shall display the Other_Roles_Input.
  When JavaScript is disabled, the Registration_Form shall show the Other_Roles_Input at page load. */

/**
 * Checks if the job role is set to other. If so, shows the Other inputs. If not, makes sure the Other inputs are hidden.
 * @param {event} event - The triggering event. In this case, selecting a value in the job title menu.
 */  
const checkJobRole = (event) => {
  let targetVal = $(`#${event.target.id}`).val();
  if(targetVal == 'other') {
    otherTitleLabel.slideDown();
    otherTitleInput.slideDown();
  } else {
    otherTitleLabel.slideUp();
    otherTitleInput.slideUp();
  }
}


/* Shirt Selection

  When the Shirt_Style is "Theme - JS Puns", the Registration_Form shall allow the user to select from the following Shirt_Colors: Cornflower Blue, Dark Slate Grey, Gold.
  When the Shirt_Style is "Theme - I Heart JS", the Registration_Form shall allow the user to select from the following Shirt_Colors: Tomato, Steel Blue, Dim Grey.
  The Registration_Form shall only display valid combinations of Shirt_Style and Shirt_Color. */

const setShirtDesign = event => {
  $(`#${event.target.id} option[value=default]`).remove();
  let targetVal = $(`#${event.target.id}`).val();
  shirtColor.slideDown();
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
  targetVal == 'js puns'
    ? $('#color').html(jsPuns)
    : $('#color').html(heartJS);
}

/* Workshops

  When the user selects the Workshop, the Registration_Form shall disable selection for all Workshops that share the same Time as the selected Workshop.
  When the user deselects the Workshop, the Registration_Form shall enable selection for all Workshops that share the same Time as the deselected Workshop.
  When the user selects a Workshop, the Registration_Form shall add the Workshop_Cost to the Total_Cost.
  The Registration_Form shall display the Total_Cost for the Workshops. */

const selectActivity = (event) => {
  const target = event.target;
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
  $('.activities label input').each(function(index, value) {
    if(this.checked) {
      totalPrice += calculatePrice(this);
    }
  });
  displayPrice(totalPrice);
}

const testConferenceTime = (time, sibTime) => {
  return time == sibTime;
}

const toggleDisabled = input => {
  if($(input).attr('disabled')) {
    $(input).removeAttr('disabled');
  } else {
    $(input).attr('disabled', true);
  }
}

const calculatePrice = activity => {
  const priceRegex = /\$(\d+)/i;
  const price = Number($(activity).parent().text().match(priceRegex)[1]);
  return price;
}

const displayPrice = price => {
  if($('#total-price').text()) {
    $('#total-price').text(`Total: $ ${price}.00`);
  } else {
    $('.activities').append(`<h2 id="total-price">Total: $ ${price}.00</h2>`);
    $('#total-price').hide().slideDown();
  }
}

/* Payments

  The Registration_Form shall default the Payment_Type to the Credit_Card_Type.
  The Registration_Form shall require the user to select one of the following Payment_Types: Credit Card, PayPal, Bitcoin.
  When the user selects the Credit_Card_Type, the Registration_Form shall display the Credit_Card_Input.
  When the user selects the PayPal_Type, the Registration_Form shall display the PayPal_Message.
  When the user selects the Bitcoin_Type, the Registration_Form shall display the Bitcoin_Message.
  When the user selects the Payment_Type, the Registration_Form shall hide all other Payment_Inputs. */

const selectPaymentType = event => {
  const paymentType = $(event.target).val();
  if(paymentType == 'credit card') {
    bitcoinMessage.slideUp();
    paypalMessage.slideUp();
    creditCardEntry.slideDown();
    requireCreditCard();
  } else if(paymentType == 'bitcoin') {
    bitcoinMessage.slideDown();
    paypalMessage.slideUp();
    creditCardEntry.slideUp();
    unrequireCreditCard();
  } else {
    bitcoinMessage.slideUp();
    paypalMessage.slideDown();
    creditCardEntry.slideUp();
    unrequireCreditCard();
  }
}

const requireCreditCard = () => {
  $('#credit-card input').each(function() {
    $(this).attr('required', true);  
  });
}

const unrequireCreditCard = () => {
  $('#credit-card input').each(function() {
    $(this).removeAttr('required');  
  });
}

/* Validation

  The Registration_Form shall ensure the user enters the Name.
  The Registration_Form shall ensure the user enters the Email_Address.
  The Registration_Form shall ensure that the user selects one or more Workshop.
  When the user pays via Credit_Card_Type, the Registration_Form shall ensure the user enters a valid Credit_Card_Number.
  When the user pays via Credit_Card_Type, the Registration_Form shall ensure the user enters the Zip_Code.
  When the user pays via Credit_Card_Type, the Registration_Form shall ensure the user enters the CVV_Code.
  When the user enters an invalid Name, the Registration_Form shall return the Name_Error to the user.
  When the user enters an invalid Email_Address, the Registration_Form shall return the Email_Error to the user.
  When the user fails to select one or more Workshops, the Registration_Form shall return the No_Workshop_Error to the user.
  When the user enters an invalid Credit_Card_Number, the Registration_Form shall return the Credit_Card_Error to the user.
  When the user enters an invalid Zip_Code, the Registration_Form shall return the Zip_Code_Error to the user.
  When the user enters an invalid CVV_Code, the Registration_Form shall return the CVV_Code_Error to the user. */

/* Submission

  The Registration_Form shall not allow submission unless the Name_Input isn't blank, the Email_Input passes Validation_Tests, one or more Workshops are selected, and the Payment_Type passes Validation_Tests.
  When the user successfully submits the Registration_Form, the Registration_Form shall reset all entry selections. */ 

/* Priority 2

  When the user selects the Shirt_Style, the Registration_Form shall display the Shirt_Color input.
  The Registration_System shall return the Validation_Error in real-time.
  When the user fails to enter the Email_Address, the Registration_Form shall return the No_Email_Error to the user.
  When {the user selects the Credit_Card_Type for Payment_Type} AND {the user fails to enter the Credit_Card_Number}, the Registration_Form shall return the No_Credit_Card_Error to the user.
  When the user fails to enter the Zip_Code, the Registration_Form shall return the No_Zip_Code_Error to the user.
  When the user fails to enter the CVV_Code, the Registration_Form shall return the No_CVV_Code_Error to the user.
  When the user successfully submits the Registration_Form, the Registration_Form shall display a Success_Message. */

/* Constraints

  The Registration_Form must work without JavaScript enabled.
  The Registration_Form must use jQuery for functionality enhancements.
  The Registration_Form must use JavaScript for validation and visual enhancements. Limited editing of the HTML.
  The Visual_Design must remain consistent with the delivered documents. */