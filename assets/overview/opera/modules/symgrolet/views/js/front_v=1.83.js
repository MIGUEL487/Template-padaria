// ELEMENTS DECLARED ON DOM LOADED
let moduleElements = {};

// FUNCTIONS
function getProductsUrl() {
  const { checkoutDate, checkoutTimeslots } = moduleElements;
  const date = checkoutDate.value;
  const timeslot = checkoutTimeslots.querySelector('.timeslot.active') ? checkoutTimeslots.querySelector('.timeslot.active')?.getAttribute('data-hours') : false;

  let products_url = '';
  if (timeslot) {
    products_url = `${sym_products_url}?date=${date}&timeslot=${timeslot}&pageName=${prestashop.page.page_name}`;
  } else {
    products_url = `${sym_products_url}?date=${date}&pageName=${prestashop.page.page_name}`;
  }

  if (typeof sym_product_id !== 'undefined') products_url += `&product_id=${sym_product_id}`;
  return products_url;
}

function onTimeslotClickChange(event) {
  const timeslot = event.target.closest('a.timeslot');
  if (!timeslot) return;
  const { changeDate } = moduleElements;
  timeslot.parentElement.querySelector('a.timeslot.active')?.classList.remove('active');
  timeslot.classList.add('active');
  changeDate.style.display = 'block'; //TODO cacher si date pas dispo
}

function clickTimeslotByPage(products_url, pageName) {
  const { checkoutProducts } = moduleElements;

  if (pageName === 'index') {
    checkoutProducts.classList.add('loading');
    $.get(products_url, function (data) {
      checkoutProducts.innerHTML = data;
      const productList = JSON.parse(document.querySelector('#jsonProductList').innerHTML);
      document.dispatchEvent(new CustomEvent('productsLoaded', { detail: productList }));
    }).always(function () {
      document.dispatchEvent(new Event('readyToReload'));
      checkoutProducts.classList.remove('loading');
    });

    return;
  }

  if (pageName === 'product' && sym_select_combination === 0) {
    $.get(products_url, (data) => {
      for (const [attributeId, maxQty] of Object.entries(data)) {
        const productAttribute = document.querySelector(`[data-quantity-input][data-id-product-attribute="${attributeId}"]`);
        productAttribute.setAttribute('max', Math.max(maxQty, 0));
        productAttribute.value = 0;
      }
    }).always(function () {
      document.dispatchEvent(new Event('readyToReload'));
    });

    return;
  }

  $.get(products_url).always(function () {
    document.dispatchEvent(new Event('readyToReload'));
  });
}

function onTimeslotClick(event) {
  const timeslot = event.target.closest('a.timeslot');
  if (!timeslot) return;
  timeslot.parentElement.querySelector('a.timeslot.active')?.classList.remove('active');
  timeslot.classList.add('active');

  const products_url = getProductsUrl();
  clickTimeslotByPage(products_url, prestashop.page.page_name);

  document.dispatchEvent(new Event('dateAndTimeSelected'));
}

function clickTimeslot(change) {
  const { checkoutDate, checkoutTimeslots, checkoutProducts } = moduleElements;
  if (checkoutDate.classList.contains('order-detail-input') && change) {
    //modification de date de commande passée : on affiche le bouton "valider" une fois le créneau choisi
    document.removeEventListener('click', onTimeslotClickChange);
    document.addEventListener('click', onTimeslotClickChange);
    return;
  }

  //checkout : fonction au changement de créneau ou au load si créneau déjà changé
  const date = checkoutDate.value;
  const timeslot = checkoutTimeslots.querySelector('.timeslot.active')?.innerHTML;
  const products_url = getProductsUrl(date, timeslot);

  if (timeslot) {
    clickTimeslotByPage(products_url, prestashop.page.page_name);
  } else if (checkoutProducts) {
    checkoutProducts.innerHTML = '';
  }

  document.removeEventListener('click', onTimeslotClick);
  document.addEventListener('click', onTimeslotClick);
}

function getTimeslots(change) {
  //get available timeslots only if not in order detail, or when change
  const { checkoutDate, checkoutTimeslots } = moduleElements;
  if (!checkoutDate) return;
  if (!checkoutDate.classList.contains('order-detail-input') || change) {
    const date = checkoutDate.value;
    if (date) {
      let url = `${sym_timeslots_url}?date=${date}`;
      if (checkoutDate.classList.contains('order-detail-input')) {
        url += `&id_order=${id_order}`;
      }
      $.get(url, (data) => {
        //on affiche toujours les produits si le créneau présélectionné existe toujours (mais en reloadant avec la nouvelle date)
        checkoutTimeslots.innerHTML = data;
        checkoutTimeslots.style.display = 'block';
        if (!document.querySelector('.timeslot.active')) {
          document.querySelector('.checkoutTimeslots .timeslot:first-child').classList.add('active');
        }
        clickTimeslot(change);
      });
    }
  }

  if (change) {
    const blockAlertWrapper = document.querySelector('.block-alert-wrapper');
    if (blockAlertWrapper) {
      blockAlertWrapper.querySelector('.block-alert')?.classList.add('loading');
      setTimeout(function () {
        $.get(`${sym_messages_url}?method=getMessage&pageName=${prestashop.page.page_name}`, function (data) {
          blockAlertWrapper.innerHTML = data;
        });
      }, 300);
    }
  }
}

function onChangeOrderTimeslot(event) {
  event.preventDefault();
  getTimeslots(true);
}

function onChangeDateClick(event) {
  const { checkoutDate } = moduleElements;
  const date = checkoutDate.value;
  const { checkoutTimeslots } = moduleElements;
  const timeslot = checkoutTimeslots.querySelector('.timeslot.active').getAttribute('data-hours');
  $.get(`${sym_change_date_url}?date=${date}&timeslot=${timeslot}&id_order=${id_order}`, (data) => {
    const result = JSON.parse(data);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error);
    }
  });
}

function updateProducts() {
  const { checkoutDate, checkoutProducts } = moduleElements;
  if (!checkoutDate) return;

  const date = checkoutDate.value;
  const products_url = getProductsUrl(date);

  checkoutProducts.classList.add('loading');
  $.get(products_url, function (data) {
    checkoutProducts.innerHTML = data;
    const productList = JSON.parse(document.querySelector('#jsonProductList').innerHTML);
    document.dispatchEvent(new CustomEvent('productsLoaded', { detail: productList }));
  }).always(function () {
    document.dispatchEvent(new Event('readyToReload'));
    checkoutProducts.classList.remove('loading');
  });
}

function updateSelectedDate() {
  const { checkoutDate } = moduleElements;
  if (!checkoutDate) return;

  const date = checkoutDate.value;
  const url = new URL(window.location);

  url.searchParams.set('selectedDate', date);
  window.history.pushState({}, '', url);
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
  moduleElements = {
    changeOrderTimeslot: document.querySelector('#changeOrderTimeslot'),
    checkoutDate: document.querySelector('#checkoutDate'),
    datesAndTimeslots: document.querySelector('#datesAndTimeslots'),
    checkoutProducts: document.querySelector('#checkoutProducts'),
    changeDate: document.querySelector('#changeDate'),
    checkoutTimeslots: document.querySelector('#checkoutTimeslots'),
  };

  const { changeOrderTimeslot, checkoutDate, changeDate } = moduleElements;

  changeOrderTimeslot?.addEventListener('click', onChangeOrderTimeslot);
  changeDate?.addEventListener('click', onChangeDateClick);
  if (checkoutDate) {
    if (checkoutDate.classList.contains('js-date-intro')) {
      checkoutDate?.addEventListener('change', () => updateProducts());
      checkoutDate?.addEventListener('change', () => updateSelectedDate());
    } else {
      checkoutDate?.addEventListener('change', () => getTimeslots(true));
      getTimeslots(false);
    }
  }

  const viewButtons = document.querySelectorAll('.js-products-button');
  if (viewButtons.length) {
    const productsContainer = document.querySelector('.js-products-container');
    if (localStorage.getItem('grid_view') === 'column') {
      productsContainer.classList.add('--column');
    }
    viewButtons.forEach(viewButton => {
      viewButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewButton.getAttribute('data-view') === 'grid') {
          localStorage.setItem('grid_view', 'grid');
          productsContainer.classList.remove('--column');
        } else {
          localStorage.setItem('grid_view', 'column');
          productsContainer.classList.add('--column');
        }
      })
    });
  }
});
