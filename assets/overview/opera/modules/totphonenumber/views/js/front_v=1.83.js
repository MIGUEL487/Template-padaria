/**
 * NOTICE OF LICENSE
 *
 * This file is licenced under the Software License Agreement.
 * With the purchase or the installation of the software in your application
 * you accept the licence agreement.
 *
 * You must not modify, adapt or create derivative works of this source code
 *
 *  @author    202-ecommerce
 *  @copyright 2010-2016 202-ecommerce
 *  @license   LICENSE.txt
 *
**/

var TPNI = {
    attr: {
        country: null,
        preferredCountry: [],
        errorText: '',
        input: {}
    },

    init: function() {
        TPNI.attr.input = jQuery('input[type="tel"], input[type="phone"], input[name="phone"], input[name="phone_mobile"]');

        TPNI.attr.input.removeAttr('data-validate').intlTelInput( {
            preferredCountries: TPNI.attr.preferredCountry,
            initialCountry: TPNI.attr.country,
            autoPlaceholder: 'aggressive'
        });

        jQuery('body')
          .on('focusout', 'input[type="tel"], input[type="phone"], input[name="phone"], input[name="phone_mobile"]', function(){
            TPNI.validate(jQuery(this));
        }).on('keypress', 'input[type="tel"], input[type="phone"], input[name="phone"], input[name="phone_mobile"]', function(press){
            return TPNI.prependSymbols(press);
        }).on('submit', 'form', function(event){
            TPNI.save(jQuery(this), event);
        });

        jQuery('button[name="submitAccount"], button[name="continue"]').click(function(event){
            TPNI.save(jQuery('body'), event);
        });
    },

    reinit: function(force)
    {
        if (typeof force === 'undefined') {
            force = true;
        }

        if (TPNI.attr.input.length > 0) {
            jQuery.each(TPNI.attr.input, function () {
                var countryData = jQuery(this).intlTelInput("getSelectedCountryData");

                if (!countryData || force) {
                    jQuery(this)
                        .intlTelInput('destroy')
                        .intlTelInput({
                            preferredCountries: TPNI.attr.preferredCountry,
                            initialCountry: countryData.iso2,
                            autoPlaceholder: 'aggressive'
                        })
                }
            });
        } else {
            TPNI.init();
        }
    },

    prependSymbols: function(press) {
        if (press.key == 'Backspace') {
            return true;
        }
        
        var reg = /^[0-9\s]+$/;
        return reg.test(press.key);
    },

    validate: function(input) {
        TPNI.reset(input);

        if (input.val().length > 0) {
            if (!input.intlTelInput('isValidNumber')) {
                input.parent()
                    .after(TPNI.attr.errorText)
                    .closest('.form-group')
                    .addClass('form-error');
                return false;
            } else {
                input.closest('.form-group').addClass('form-ok');
                return true;
            }
        }
    },

    save: function(form, event) {
        var inputs = form.find('input[type="tel"], input[type="phone"], input[name="phone"], input[name="phone_mobile"]');

        if (inputs.length > 0) {
            jQuery.each(inputs, function(i, value){
                var input = jQuery(value);

                if (input.val().length > 0) {
                    var isValid = TPNI.validate(input);

                    if (isValid) {
                        var intlNumber = input.intlTelInput('getNumber');

                        input.val(intlNumber);
                    } else {
                        event.preventDefault();
                    }
                }
            });
        }
    },

    reset: function(input) {
        input.closest('.form-group')
            .removeClass('form-error')
            .removeClass('form-ok');

        input.parent().next('p.intlError').remove();
    }
};
