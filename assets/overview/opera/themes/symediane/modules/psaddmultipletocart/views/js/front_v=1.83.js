/**
* Since 2015 Ewonta
*
* NOTICE OF LICENSE
*
* This file is not open source! Each license that you purchased is only available for 1 wesite only.
* If you want to use this file on more websites (or projects), you need to purchase additional licenses. 
* You are not allowed to redistribute, resell, lease, license, sub-license or offer our resources to any third party.
*
*  @author Ewonta <support@ewonta.ru>
*  @copyright  Since 2015 Ewonta
*  @license    Valid for 1 website (or project) for each purchase of license
*/

// $(document).ready(() => {
//   addPsaddmultipletocart();
//   prestashop.on('updateProductList', () => {
//     addPsaddmultipletocart();
//   });
//   if (!am_version_ps) {
//     $(document).on('hidden.bs.modal', '.modal', function () {
//       $('.modal:visible').length && $(document.body).addClass('modal-open');
//     });
//   }
  
//   $(document).on('click','.multiple_to_cart',function(){
//     var thiss = $(this);
//     thiss.find('i').html('autorenew').addClass('atc_spinner');
//     $('.cssload-container-fitting').show();
    
//     $('#fit_fast_data').innerHTML = 'asasasas';
//     $('#fit_fast_data').hide();
//     $.ajax({
//       type: 'GET',
//       url: link_multipletocart,
//       headers: { "cache-control": "no-cache" },
//       async: true,
//       cache:false,
//       data: 'id_product='+$(this).attr('data-id'),
//       success: function(data) {
//         $('#fit_fast_data').innerHTML = data;
//         $('.cssload-container-fitting').hide();
//         $('#fit_fast_data').show();
//         thiss.find('i').html('add_shopping_cart').removeClass('atc_spinner');
//       }
//     }).done(function( msg ) {
//       $( "#fit_fast_data" ).html(msg);
//       $('.cssload-container-fitting').hide();
//       $('#fit_fast_data').show();
//       thiss.find('i').html('add_shopping_cart').removeClass('atc_spinner');
//     });
//   });
//   $(document).on('click','.multiple_to_cart_one',function(){
//     var thiss = $(this);
//     idCombination = 0;
//     quantity = 1;
//     thiss.find('i').html('autorenew').addClass('atc_spinner');
//     idProduct = $(this).attr('data-id');
//     $.ajax({
//       type: 'POST',
//       headers: { "cache-control": "no-cache" },
//       url: prestashop['urls']['pages']['cart'] + '?rand=' + new Date()['getTime'](),
//       async: true,
//       cache: false,
//       dataType: 'json',
//       data: 'action=update&add=1&ajax=true&qty=' + ((quantity && quantity != null) ? quantity : '1') + '&id_product=' + idProduct + '&token=' + prestashop['static_token'] + ((parseInt(idCombination) && idCombination != null) ? '&ipa=' + parseInt(idCombination) : '' + '&id_customization=' + ((typeof customizationId !== 'undefined') ? customizationId : 0)),
//       success: function(success) {
//         thiss.find('i').html('add_shopping_cart').removeClass('atc_spinner');
//         prestashop.emit('updateCart', { 
//           reason: {
//             idProduct: idProduct,
//             idProductAttribute: idCombination,
//             linkAction: 'add-to-cart'
//           },
//           resp: success 
//         })
//       }
//     })
//   });
//   // 
//   if ($('body').is('#product')) {
//     $(document).on('click','.add_to_cart',function(){
//       var thiss = $(this);
//       thiss.find('i').html('autorenew').addClass('atc_spinner');
//       idCombination = thiss.attr('data-id-product-attribute');
//       quantity = $('.comb-count-'+idCombination).val();
      
//       idProduct = thiss.attr('data-id-product');
      
//       $.ajax({
//         type: 'POST',
//         headers: { "cache-control": "no-cache" },
//         url: prestashop['urls']['pages']['cart'] + '?rand=' + new Date()['getTime'](),
//         async: true,
//         cache: false,
//         dataType: 'json',
//         data: 'action=update&add=1&ajax=true&qty=' + ((quantity && quantity != null) ? quantity : '1') + '&id_product=' + idProduct + '&token=' + prestashop['static_token'] + ((parseInt(idCombination) && idCombination != null) ? '&ipa=' + parseInt(idCombination) : '' + '&id_customization=' + ((typeof customizationId !== 'undefined') ? customizationId : 0)),
//         success: function(success) {
//           thiss.find('i').html('add_shopping_cart').removeClass('atc_spinner');
          
//           prestashop.emit('updateCart', { 
//             reason: {
//               idProduct: idProduct,
//               idProductAttribute: idCombination,
//               linkAction: 'add-to-cart'
//             },
//             resp: success 
//           })
//         }
//       })
//     });
//   }
  
  
//   $(document).on('click','#selall_m', function(){
//     if  (!$("#selall_m").is(":checked")){
      
//       $(".view_checkbox_add").prop('checked', false);
//     }
//     else{
      
//       $(".view_checkbox_add").prop('checked', true);
//     }
    
//   });
  
//   //Добавляем выбранные
  
//   //selected_to_cart désactivé par défaut, activer si quantité TODO ET si autorisé à commander pour la date choisie
//   $('body').on('change', '.atc_qty', function() {
//     let sum = 0;
//     const $parent = $(this).closest('.box_psaddmultipletocart');
//     $parent.find(".atc_qty").each(function(){
//       sum += +$(this).val();
//     });
//     if (sum > 0) {
//       $parent.find('.selected_to_cart').prop('disabled', false);
//     } else {
//       $parent.find('.selected_to_cart').prop('disabled', true);
//     }
//   })
  
//   $(document).on('click','.selected_to_cart', function(){
//     var thiss = $(this);
//     var i = 0;
//     thiss.find('i').html('autorenew').addClass('atc_spinner');
    
//     $('.atc_qty').each((index, element) => {
//       let idCombination = $(element).attr('data-id-product-attribute');
//       let quantity = $('.comb-count-'+idCombination).val();
//       if (quantity > 0) {
        
//         idProduct = $(element).attr('data-id-product');
//         $.ajax({
//           type: 'POST',
//           headers: { "cache-control": "no-cache" },
//           url: prestashop['urls']['pages']['cart'] + '?rand=' + new Date()['getTime'](),
//           async: true,
//           cache: false,
//           dataType: 'json',
//           data: 'action=update&add=1&ajax=true&qty=' + ((quantity && quantity != null) ? quantity : '1') + '&id_product=' + idProduct + '&token=' + prestashop['static_token'] + ((parseInt(idCombination) && idCombination != null) ? '&ipa=' + parseInt(idCombination) : '' + '&id_customization=' + ((typeof customizationId !== 'undefined') ? customizationId : 0)),
//           success: function(success) {
//             thiss.find('i').html('add_shopping_cart').removeClass('atc_spinner');
            
//             if (success.success == true) {
//               $('.primary_add_multi').hide();
//               $('.success_add_multi').fadeIn();
              
//               prestashop.emit('updateCart', { 
//                 reason: {
//                   idProduct: idProduct,
//                   idProductAttribute: idCombination,
//                   linkAction: ''
//                 },
//                 resp: success 
//               })
//             }
            
//           }
//         })
//         i++;
//       }
//     });
//     if (Number(i) == 0) {
//       $('.success_add_multi').hide();
//       $('.primary_add_multi').fadeIn();
//       thiss.find('i').html('add_shopping_cart').removeClass('atc_spinner');
//     }
//   });
  
//   $('body').on('click', '.addmultipletocart_minus', function () {
//     var $input = $(this).parent().find('input');
//     let current = $input.val();
//     var count = parseInt($input.val()) - 1;
//     count = count < 0 ? 0 : count;
//     $input.val(count);
//     $input.change();
//     $parent = $(this).closest('.box_psaddmultipletocart');
//     if (current != count) {
//       updateOtherInput($parent, $input, '-');
//     }
//     return false;
//   });
  
//   $('body').on('click', '.addmultipletocart_plus', function () {
//     var $input = $(this).parent().find('input');
//     let current = $input.val();
//     var count = parseInt($input.val()) + 1;
//     count = count > $input.prop('max') ? $input.prop('max') : count;
//     $input.val(count);
//     $input.change();
//     $parent = $(this).closest('.box_psaddmultipletocart');
//     if (current != count) {
//       updateOtherInput($parent, $input, '+');
//     }
//     return false;
//   });
  
//   function updateOtherInput($parent, $input, $sign) {
//     $parent.find('.atc_qty').not($input).each(function(){
//       let current = parseInt($(this).attr('max'));
//       if ($sign == '+') {
//         $(this).attr('max', current - 1);
//       } else {
//         $(this).attr('max', current + 1);
//       }
//     });
//   }
// });

// function addPsaddmultipletocart(){
//   $('.js-product-miniature').each((index, element) => {
//     let $fittingroom = $(element).find('.add_psaddmultipletocart_prod');
    
//     if($fittingroom.length){
      
//       $(element).find('.thumbnail-container').append( $fittingroom );
//     }
//   });
//   $('.add_psaddmultipletocart_prod').show();
// }