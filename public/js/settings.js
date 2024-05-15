;(function (w,d) {

  function scanForPages() {

    const req = new XMLHttpRequest(),
          data = "scan=true"
    ;

    req.onreadystatechange = () => {
      if (req.readyState === XMLHttpRequest.DONE && req.status === 200) {
        showNotifications(req.responseText)
      }
    };

    req.onloadstart = () => {
      showNotifications('starting scan');
    };

    req.open('POST', '/settings/update-pages', true);

    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    req.send(data);

  }

  function showNotifications(message) {

    const wrapper = d.querySelector('.notificationsWrapper'),
          box = d.querySelector('.notificationsBox')
    ;

    if (typeof message === 'string') {
      box.innerHTML = message;
    } else {
      box.innerHtml = 'working';
    }

    wrapper.style.visibility = 'visible';
    wrapper.style.transform = 'translateX(0%)';

  }

  function hideNotifications() {
    const wrapper = d.querySelector('.notificationsWrapper');
    wrapper.style.transform = 'translateX(110%)';
  }

  d.addEventListener('DOMContentLoaded', () => {
    const closeNotificationsBtn = d.getElementById('notificationsCloseBtn');
    const scanBtn = d.getElementById('scanDirForPages');
    scanBtn.addEventListener('click', scanForPages); // make sure you cannot click this button again while it is already scanning for pages
    closeNotificationsBtn.addEventListener('click', hideNotifications);
  })


})(window, document);
