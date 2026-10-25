/**
 * 2012 - 2024 HiPresta
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License 3.0 (AFL-3.0).
 * It is also available through the world-wide-web at this URL: https://opensource.org/licenses/AFL-3.0
 *
 * @author    HiPresta <support@hipresta.com>
 * @copyright HiPresta 2024
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License version 3.0
 *
 * @website   https://hipresta.com
 */
$(document).ready(function() {
    if (typeof hiCookieLaw !== 'undefined') {
        initHicookie();
    }
 });
 
function initHicookie() {
    if (hiCookieLaw.position == 'popup' && $('.hi-cookie-edit-mode').length == 0 && sessionStorage.getItem('hi-cookie-accepted') != 1) {
        $('.hi-cookie-block').removeClass('hi-module-hide');
        $.magnificPopup.open({
            items: {
                src: '.hi-cookie-block-popup'
            },
            type: 'inline',
            midClick: true,
            removalDelay: 0,
            mainClass: 'mfp-fade',
            closeOnBgClick: false,
            showCloseBtn: false,
            enableEscapeKey: false,
            modal: true,
         }, 0);
    } else if (sessionStorage.getItem('hi-cookie-accepted') != 1) {
        $('.hi-cookie-block').removeClass('hi-module-hide');
    } 
    $('.hi-cookie-btn-accept, .hi-cookie-btn-accept-selected, .hi-cookie-btn-accept-all').click(function() {
        var $this = $(this);
 
        if ($(this).attr('data-type') == 'all') {
            $('.hi-cookie-type:checkbox:not(:checked)').each(function(){
                $(this).prop('checked', true);
            });
        }
        var acceptedTypes = $('.hi-cookie-type:checkbox:checked').map(function(){
            return $(this).val();
        }).get();
        var notAcceptedTypes = $('.hi-cookie-type:checkbox:not(:checked)').map(function(){
            return $(this).val();
        }).get();
        $.ajax({
            type: 'POST',
            dataType: 'JSON',
            url: hiCookieLaw.frontUrl,
            data: {
                ajax: true,
                secure_key: hiCookieLaw.secureKey,
                action: 'set_cookie',
                acceptedTypes: acceptedTypes,
                notAcceptedTypes: notAcceptedTypes
            },
            beforeSend: function() {
                $this.addClass('hi-cookie-btn-loading').attr('disabled', 'disabled');
            },
            success: function(response) {
                $this.removeClass('hi-cookie-btn-loading').removeAttr('disabled');
 
                if ($('.hi-cookie-edit-mode').length > 0 || hiCookieLaw.position == 'popup') {
                    $.magnificPopup.close();
                } else {
                    // $('.hi-cookie-block').hide(200);
                    $('.hi-cookie-block').addClass('white-popup mfp-hide hi-cookie-block-popup hi-cookie-edit-mode');
                    $('.hi-cookie-law-overlay').remove();
                }

                $('.hi-cookie-widget').removeClass('hi-module-hide');

 
                 if (hiCookieGoogleConsentSettings.consentMode) {
                    gtag('consent', 'update', {
                        'ad_storage': response.adStorageCookieTypeGranted,
                        'analytics_storage': response.analyticsStorageCookieTypeGranted,
                        'ad_user_data': response.adUserDataCookieTypeGranted,
                        'ad_personalization': response.adPersonalizationCookieTypeGranted,
                        'functionality_storage': response.functionalityStorageCookieTypeGranted,
                        'personalization_storage': response.personalizationStorageCookieTypeGranted,
                        'security_storage': response.securityStorageCookieTypeGranted,
                    });
                 }
                 if (hiCookieLaw.reloadPage) {
                    window.location.reload();
                 }
            }
        });
 
        return false;
    });
 
    $('.hi-cookie-btn-accept-necessary').click(function() {
        var $this = $(this);
        var acceptedTypes = $('.hi-cookie-type:checkbox:disabled').map(function(){
            return $(this).val();
        }).get();
        var notAcceptedTypes = $('.hi-cookie-type:checkbox:not(:disabled)').map(function(){
            return $(this).val();
        }).get();
        $.ajax({
            type: 'POST',
            dataType: 'JSON',
            url: hiCookieLaw.frontUrl,
            data: {
                ajax: true,
                secure_key: hiCookieLaw.secureKey,
                action: 'set_cookie',
                reject: true,
                acceptedTypes: acceptedTypes,
                notAcceptedTypes: notAcceptedTypes
            },
            beforeSend: function() {
                $this.addClass('hi-cookie-btn-loading').attr('disabled', 'disabled');
            },
            success: function(response) {
                $this.removeClass('hi-cookie-btn-loading').removeAttr('disabled');
 
                if ($('.hi-cookie-edit-mode').length > 0 || hiCookieLaw.position == 'popup') {
                    $.magnificPopup.close();
                } else {
                    // $('.hi-cookie-block').hide(200);
                    $('.hi-cookie-block').addClass('white-popup mfp-hide hi-cookie-block-popup hi-cookie-edit-mode');
                    $('.hi-cookie-law-overlay').remove();
                }
                $('.hi-cookie-widget').removeClass('hi-module-hide');
                
                if (hiCookieGoogleConsentSettings.consentMode) {
                    gtag('consent', 'update', {
                        'ad_storage': response.adStorageCookieTypeGranted,
                        'analytics_storage': response.analyticsStorageCookieTypeGranted,
                        'ad_user_data': response.adUserDataCookieTypeGranted,
                        'ad_personalization': response.adPersonalizationCookieTypeGranted,
                        'functionality_storage': response.functionalityStorageCookieTypeGranted,
                        'personalization_storage': response.personalizationStorageCookieTypeGranted,
                        'security_storage': response.securityStorageCookieTypeGranted,
                    });
                }
 
                if (hiCookieLaw.reloadPage) {
                    window.location.reload();
                }
             }
        });
 
        return false;
    });
 
    $('.hi-cookie-btn-customize').on('click', function(){
        $('.hi-cookie-selects').slideToggle('slow', function(){
            if ($('.hi-cookie-selects').is(':visible')) {
                $('.hi-cookie-accept-all-template-1').addClass('hi-module-hide');
                $('.hi-cookie-accept-selected-template-1').removeClass('hi-module-hide');
            } else {
                $('.hi-cookie-accept-all-template-1').removeClass('hi-module-hide');
                $('.hi-cookie-accept-selected-template-1').addClass('hi-module-hide');
            }
        });
 
        return false;
    });
 
    if (hiCookieLaw.consentOnNavigation && $('.hi-cookie-block').is(":visible")) {
        var acceptedTypes = $('.hi-cookie-type:checkbox:checked').map(function(){
            return $(this).val();
        }).get();
        var notAcceptedTypes = $('.hi-cookie-type:checkbox:not(:checked)').map(function(){
            return $(this).val();
        }).get();

        $.ajax({
            type: 'POST',
            dataType: 'JSON',
            url: hiCookieLaw.frontUrl,
            data: {
                ajax: true,
                secure_key: hiCookieLaw.secureKey,
                action: 'set_cookie',
                acceptedTypes: acceptedTypes,
                notAcceptedTypes: notAcceptedTypes
            },
            success: function(response) {
                if (hiCookieGoogleConsentSettings.consentMode) {
                    gtag('consent', 'update', {
                        'ad_storage': response.adStorageCookieTypeGranted,
                        'analytics_storage': response.analyticsStorageCookieTypeGranted,
                        'ad_user_data': response.adUserDataCookieTypeGranted,
                        'ad_personalization': response.adPersonalizationCookieTypeGranted,
                        'functionality_storage': response.functionalityStorageCookieTypeGranted,
                        'personalization_storage': response.personalizationStorageCookieTypeGranted,
                        'security_storage': response.securityStorageCookieTypeGranted,
                    });
                }
            }
        });
    }
 
    if (hiCookieLaw.blockNavigation && $('.hi-cookie-block').is(":visible") && hiCookieLaw.position != 'popup') {
        $('body').append('<div class="hi-cookie-law-overlay" />');
    }
    
    $(document).on('click', '.js-hi-cookie-settings-btn', function() {
        if ($('.hi-cookie-block').is(":visible")) {
            return false;
        }

        $('.hi-cookie-block-popup').removeClass('hi-module-hide');

        $.magnificPopup.open({
            items: {
                src: '.hi-cookie-block-popup'
            },
            type: 'inline',
            midClick: true,
            removalDelay: 0,
            mainClass: 'mfp-fade',
            closeOnBgClick: true,
            showCloseBtn: true,
            enableEscapeKey: true,
            modal: false
        }, 0);
     
        return false;
    });
 
    $(document).on('click', '.hi-cookie-continue-without-accepting', function(e) {
        e.preventDefault();
     
        if (hiCookieLaw.position == 'popup') {
            $.magnificPopup.close();
        } else {
            // $('.hi-cookie-block').hide(200);
            $('.hi-cookie-block').addClass('white-popup mfp-hide hi-cookie-block-popup hi-cookie-edit-mode');
            $('.hi-cookie-law-overlay').remove();
        }

        $('.hi-cookie-widget').removeClass('hi-module-hide');
 
        sessionStorage.setItem('hi-cookie-accepted', 1);
     });
 }
 